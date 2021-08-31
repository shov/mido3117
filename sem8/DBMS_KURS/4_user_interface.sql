USE hotel_booking;
GO

-- select free rooms from all hotels for date range
CREATE OR
ALTER FUNCTION fetch_free_rooms_on_date_range(
    @check_in_date       DATE,
    @check_out_date      DATE,
    @guests_number       TINYINT,
    @preferred_floor     TINYINT = NULL, -- optional
    @preferred_room_kind NVARCHAR(255) = NULL, -- optional
    @preferred_options   NVARCHAR(MAX) = NULL) -- optional
    RETURNS @result_table TABLE (
        batch          TINYINT,
        filter_step    NVARCHAR(255),
        check_in_date  DATE          NOT NULL,
        check_out_date DATE          NOT NULL,
        hotel_name     NVARCHAR(255) NOT NULL,
        hotel_id       BIGINT        NOT NULL,
        room_id        BIGINT        NOT NULL,
        room_size      TINYINT       NOT NULL,
        room_kind      NVARCHAR(255) NOT NULL,
        room_options   NVARCHAR(MAX),
        room_price     MONEY         NOT NULL
    ) AS
BEGIN
    IF (@check_in_date IS NULL)
        OR (@check_out_date IS NULL)
        OR (@check_in_date >= @check_out_date)
        OR (@guests_number < 1)
        OR ((@preferred_floor IS NOT NULL) AND @preferred_floor < 1)
        OR (@preferred_options IS NOT NULL AND (ISJSON(@preferred_options) < 1))
        BEGIN
            RETURN;
        END;

    DECLARE @free_rooms TABLE (
        batch       TINYINT,
        filter_step NVARCHAR(255),
        hotel_id    BIGINT,
        room_id     BIGINT
    );

    DECLARE @last_batch TINYINT = 0;

    INSERT INTO @free_rooms
    SELECT 0 AS batch, N'Free on dates' AS filter_step,
        r.hotel_id AS hotel_id, r.id AS room_id
    FROM rooms r
             LEFT JOIN books b ON r.id = b.room_id AND b.approved = 1
        AND ((@check_in_date < b.check_out_date) AND (@check_out_date > b.check_in_date))
    WHERE b.id IS NULL;


    INSERT INTO @free_rooms
    SELECT @last_batch + 1 AS batch, N'Free for gusts number' AS filter_step,
        r.hotel_id, r.id AS room_id
    FROM rooms r
             JOIN room_kinds rk ON r.room_kind_id = rk.id
             JOIN @free_rooms fr ON fr.room_id = r.id AND fr.batch = @last_batch
    WHERE rk.size >= @guests_number;
    SET @last_batch = @last_batch + 1;

    IF (@preferred_floor IS NOT NULL)
        BEGIN
            INSERT INTO @free_rooms
            SELECT @last_batch + 1 AS batch, N'Free on floor' AS filter_step,
                r.hotel_id, r.id AS room_id
            FROM rooms r
                     JOIN @free_rooms fr ON fr.room_id = r.id AND fr.batch = @last_batch
            WHERE r.floor = @preferred_floor;
            SET @last_batch = @last_batch + 1;
        END;

    IF (@preferred_room_kind IS NOT NULL)
        BEGIN
            INSERT INTO @free_rooms
            SELECT @last_batch + 1 AS batch, N'Free of room kind' AS filter_step,
                r.hotel_id, r.id AS room_id
            FROM rooms r
                     JOIN @free_rooms fr ON fr.room_id = r.id AND fr.batch = @last_batch
                     JOIN room_kinds rk ON r.room_kind_id = rk.id
            WHERE rk.name = @preferred_room_kind;
            SET @last_batch = @last_batch + 1;
        END;

    IF (@preferred_options IS NOT NULL)
        BEGIN
            INSERT INTO @free_rooms
            SELECT @last_batch + 1 AS batch, N'Free for options' AS filter_step,
                r.hotel_id, r.id AS room_id
            FROM rooms r
                     JOIN @free_rooms fr ON fr.room_id = r.id
                AND fr.batch = @last_batch
                AND
                                            (COALESCE(CAST(JSON_VALUE(@preferred_options, '$.miniBar') AS BIT), 0) = 0 OR
                                             COALESCE(CAST(JSON_VALUE(@preferred_options, '$.miniBar') AS BIT), 0) =
                                             COALESCE(CAST(JSON_VALUE(r.options, '$.miniBar') AS BIT), 0)) AND
                                            (COALESCE(CAST(JSON_VALUE(@preferred_options, '$.hairdryer') AS BIT), 0) = 0 OR
                                             COALESCE(CAST(JSON_VALUE(@preferred_options, '$.hairdryer') AS BIT), 0) =
                                             COALESCE(CAST(JSON_VALUE(r.options, '$.hairdryer') AS BIT), 0)) AND
                                            (COALESCE(CAST(JSON_VALUE(@preferred_options, '$.robeAndSlippers') AS BIT), 0) = 0 OR
                                             COALESCE(CAST(JSON_VALUE(@preferred_options, '$.robeAndSlippers') AS BIT), 0) =
                                             COALESCE(CAST(JSON_VALUE(r.options, '$.robeAndSlippers') AS BIT), 0));
            SET @last_batch = @last_batch + 1;
        END;

    INSERT INTO @result_table
    SELECT fr.batch AS batch,
        fr.filter_step AS filter_step,
        @check_in_date check_in_date,
        @check_out_date check_out_date,
        h.name AS hotel_name,
        h.id AS hotel_id,
        r.id AS room_id,
        rk.size AS room_size,
        rk.name AS room_kind,
        r.options AS options,
        r.night_price AS room_price
    FROM rooms r
             JOIN room_kinds rk ON r.room_kind_id = rk.id
             JOIN hotels h ON r.hotel_id = h.id
             JOIN @free_rooms fr ON r.id = fr.room_id;
    RETURN;
END;
GO

-- book a room
CREATE OR
ALTER PROCEDURE book_a_room @check_in_date               DATE,
                            @check_out_date              DATE,
                            @guests_number               TINYINT,
                            @late_check_in_time          TIME = NULL, -- optional
                            @room_id                     BIGINT,
                            @registered_by_name          NVARCHAR(255),
                            @registered_by_sure_name     NVARCHAR(255),
                            @registered_by_middle_name   NVARCHAR(255) = NULL, -- optional
                            @registered_by_passport_data NVARCHAR(255)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS(SELECT *
                      FROM fetch_free_rooms_on_date_range(
                              @check_in_date, @check_out_date, @guests_number, DEFAULT, DEFAULT, DEFAULT
                          )
                      WHERE batch = 1 AND room_id = @room_id)
            BEGIN
                THROW 51000, 'This room is not available for the dates and/or given guest number', 1;
            END;

        DECLARE @registered_by_id_result TABLE (
            id BIGINT
        );

        INSERT INTO @registered_by_id_result SELECT id FROM guests WHERE passport_data = @registered_by_passport_data;

        IF EXISTS(SELECT id FROM @registered_by_id_result)
            BEGIN
                UPDATE guests
                SET name = @registered_by_name, sure_name = @registered_by_sure_name, middle_name = @registered_by_middle_name
                WHERE passport_data = @registered_by_passport_data;
            END
        ELSE
            BEGIN
                INSERT INTO guests (name, sure_name, middle_name, passport_data)
                OUTPUT inserted.id INTO @registered_by_id_result
                VALUES (@registered_by_name,
                        @registered_by_sure_name,
                        @registered_by_middle_name,
                        @registered_by_passport_data);
            END

        DECLARE @booked_record_id_result TABLE (
            id BIGINT
        );

        INSERT INTO books (room_id, check_in_date, check_out_date, late_check_out_time, approved)
        OUTPUT inserted.id INTO @booked_record_id_result
        VALUES (@room_id, @check_in_date, @check_out_date, @late_check_in_time, 0);

        DECLARE @booked_record_id BIGINT;
        DECLARE @guest_kind_id BIGINT;
        DECLARE @registered_by_id BIGINT;
        SET @booked_record_id = (SELECT TOP 1 id FROM @booked_record_id_result);
        SET @registered_by_id = (SELECT TOP 1 id FROM @registered_by_id_result);
        SET @guest_kind_id = (SELECT TOP 1 id FROM guest_kinds WHERE name = N'registered_by');

        INSERT INTO book_guests (book_id, guest_id, guest_kind_id) VALUES (@booked_record_id, @registered_by_id, @guest_kind_id)

        DECLARE @bill_kind_id BIGINT;
        DECLARE @bill_status_id BIGINT;
        DECLARE @room_price MONEY;
        SET @bill_kind_id = (SELECT TOP 1 id FROM bill_kinds WHERE name = N'room_rent');
        SET @bill_status_id = (SELECT TOP 1 id FROM bill_statuses WHERE name = N'pending');
        SET @room_price = (SELECT TOP 1 night_price FROM rooms WHERE id = @room_id);
        INSERT INTO bills (book_id, bill_kind_id, product_id, bill_status_id, cost, recipient_ref)
        VALUES (@booked_record_id, @bill_kind_id, NULL, @bill_status_id, @room_price, @registered_by_passport_data);

        UPDATE books SET approved = 1 WHERE id = @booked_record_id;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- check-in
-- get allowed products for a booking
-- order a product
-- list not paid bills
-- pay a bill
-- list tomorrow check-out
