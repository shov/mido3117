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
             LEFT JOIN books b ON r.id = b.room_id
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
CREATE PROCEDURE book_a_room check_in_date               DATE,
                             check_out_date              DATE,
                             late_check_in_time          TIME = NULL,
                             room_id                     BIGINT,
                             registered_by_name          NVARCHAR(255),
                             registered_by_sure_name     NVARCHAR(255),
                             registered_by_middle_name   NVARCHAR(255) = NULL,
                             registered_by_passport_data NVARCHAR(255)
AS
BEGIN
END;
GO

INSERT INTO books (room_id, check_in_date, check_out_date)
VALUES (51, '2021-01-05', '2021-02-01');

-- check-in
-- get allowed products for a booking
-- order a product
-- list not paid bills
-- pay a bill
-- list tomorrow check-out
