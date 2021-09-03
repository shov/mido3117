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

        DECLARE
            @booked_record_id BIGINT,
            @guest_kind_id BIGINT,
            @registered_by_id BIGINT;
        SET @booked_record_id = (SELECT TOP 1 id FROM @booked_record_id_result);
        SET @registered_by_id = (SELECT TOP 1 id FROM @registered_by_id_result);
        SET @guest_kind_id = (SELECT TOP 1 id FROM guest_kinds WHERE name = N'registered_by');

        INSERT INTO book_guests (book_id, guest_id, guest_kind_id) VALUES (@booked_record_id, @registered_by_id, @guest_kind_id)

        DECLARE
            @bill_kind_id BIGINT,
            @bill_status_id BIGINT,
            @room_price MONEY;
        SET @bill_kind_id = (SELECT TOP 1 id FROM bill_kinds WHERE name = N'room_rent');
        SET @bill_status_id = (SELECT TOP 1 id FROM bill_statuses WHERE name = N'pending');
        SET @room_price = (SELECT TOP 1 night_price FROM rooms WHERE id = @room_id);
        INSERT INTO bills (book_id, bill_kind_id, product_id, bill_status_id, cost, recipient_ref)
        VALUES (@booked_record_id, @bill_kind_id, NULL, @bill_status_id, @room_price * DATEDIFF(DAY, @check_in_date, @check_out_date),
                @registered_by_passport_data);

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
CREATE OR
ALTER PROCEDURE check_in_guest @book_id        BIGINT,
                               @name           NVARCHAR(255),
                               @sure_name      NVARCHAR(255),
                               @middle_name    NVARCHAR(255) = NULL, -- optional
                               @passport_data  NVARCHAR(255),
                               @is_responsible BIT = 0 -- by default it's regular guest
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        -- the book must exists and guests can check-in only from check-in date
        -- and not later than the midnight before checking-out:
        IF @book_id IS NULL OR NOT EXISTS(SELECT *
                                          FROM books b
                                          WHERE b.id = @book_id AND CAST(GETUTCDATE() AS DATE) < b.check_out_date AND
                                              CAST(GETUTCDATE() AS DATE) >= b.check_in_date AND b.approved = 1)
            BEGIN
                THROW 51000, 'Invalid book or the moment does not fit the checking-in', 1;
            END;

        -- make sure the guest, fresh their data
        DECLARE @guest_found_result TABLE (
            id BIGINT
        );

        INSERT INTO @guest_found_result SELECT id FROM guests WHERE passport_data = @passport_data;

        IF EXISTS(SELECT id FROM @guest_found_result)
            BEGIN
                UPDATE guests
                SET name = @name, sure_name = @sure_name, middle_name = @middle_name
                WHERE passport_data = @passport_data;
            END
        ELSE
            BEGIN
                INSERT INTO guests (name, sure_name, middle_name, passport_data)
                OUTPUT inserted.id INTO @guest_found_result
                VALUES (@name,
                        @sure_name,
                        @middle_name,
                        @passport_data);
            END

        DECLARE
            @guest_id BIGINT,
            @g_resp_id BIGINT,
            @g_regu_id BIGINT,
            @guest_kind_id BIGINT;

        SET @guest_id = (SELECT TOP 1 id FROM @guest_found_result);
        SET @g_resp_id = (SELECT id FROM guest_kinds WHERE name = N'responsible');
        SET @g_regu_id = (SELECT id FROM guest_kinds WHERE name = N'regular');
        SET @guest_kind_id = IIF(@is_responsible = 1, @g_resp_id, @g_regu_id);

        -- responsible must be only one and registered first:
        IF (@is_responsible = 1) AND EXISTS(SELECT * FROM book_guests WHERE book_id = @book_id AND guest_kind_id = @g_resp_id)
            BEGIN
                THROW 51000, 'A book must not have more than on responsible guest!', 1;
            END

        IF (@is_responsible = 0) AND NOT EXISTS(SELECT * FROM book_guests WHERE book_id = @book_id AND guest_kind_id = @g_resp_id)
            BEGIN
                THROW 51000, 'Responsible guest must be checked-out first!', 1;
            END

        -- the guest cannot be checked-in twice as responsible either regular (but can as registered_by)
        IF EXISTS(SELECT * FROM book_guests WHERE book_id = @book_id AND guest_id = @guest_id AND guest_kind_id IN (@g_resp_id, @g_regu_id))
            BEGIN
                THROW 51000, 'This guest already has checked-in!', 1;
            END

        -- room size limit check:
        DECLARE
            @registered_count TINYINT = 0,
            @room_size TINYINT;

        SET @registered_count = (SELECT CAST(count(*) AS TINYINT)
                                 FROM book_guests bg
                                          JOIN guest_kinds gk ON gk.id = bg.guest_kind_id
                                 WHERE book_id = @book_id AND gk.id IN (@g_resp_id, @g_regu_id));

        SET @room_size = (SELECT TOP 1 rk.size
                          FROM room_kinds rk
                                   JOIN rooms r ON r.room_kind_id = rk.id
                                   JOIN books b ON b.room_id = r.id
                          WHERE b.id = @book_id)

        IF (@room_size < (@registered_count + 1))
            BEGIN
                THROW 51000, 'Room size limit reached!', 1;
            END

        -- else we add new guest to the book
        INSERT INTO book_guests (book_id, guest_id, guest_kind_id) VALUES (@book_id, @guest_id, @guest_kind_id);

        -- if the responsible has appeared, set all bills on they
        IF (@is_responsible = 1)
            BEGIN
                UPDATE bills SET recipient_ref = @passport_data WHERE book_id = @book_id;

                -- if it's first guest (the first must be responsible) set checkin fatcts
                UPDATE books SET fact_check_in = GETUTCDATE() WHERE id = @book_id;
            END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


-- order a product
CREATE OR
ALTER PROCEDURE order_product @book_id      BIGINT,
                              @product_name NVARCHAR(255),
                              @amount       TINYINT = 1
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        -- the book must exists and guests can check-in only from check-in date
        -- and not later than the midnight before checking-out:
        IF @book_id IS NULL OR NOT EXISTS(SELECT *
                                          FROM books b
                                          WHERE b.id = @book_id AND CAST(GETUTCDATE() AS DATE) < b.check_out_date AND
                                              CAST(GETUTCDATE() AS DATE) >= b.check_in_date AND b.approved = 1)
            BEGIN
                THROW 51000, 'Invalid book or you are not allowed to order anything now', 1;
            END;

        -- if product exists in this hotel
        DECLARE
            @hotel_id BIGINT,
            @product_id BIGINT,
            @price MONEY;

        SET @hotel_id = (SELECT TOP 1 h.id
                         FROM hotels h
                                  JOIN rooms r ON h.id = r.hotel_id
                                  JOIN books b ON r.id = b.room_id
                         WHERE b.id = @book_id);

        IF @hotel_id IS NULL
            BEGIN
                THROW 51000, 'Hotel not found', 1;
            END

        SET @product_id = (SELECT TOP 1 id FROM products WHERE hotel_id = @hotel_id AND name = @product_name);

        IF @product_id IS NULL
            BEGIN
                THROW 51000, 'Product not found', 1;
            END

        SET @price = (SELECT TOP 1 price FROM products WHERE id = @product_id);

        -- the book must have responsible guests to order
        DECLARE @resp_guest_id_result TABLE (
            id BIGINT
        );

        DECLARE
            @g_resp_id BIGINT,
            @resp_guest_passport_ref NVARCHAR(255);

        SET @g_resp_id = (SELECT TOP 1 id FROM guest_kinds WHERE name = N'responsible');
        INSERT INTO @resp_guest_id_result
        SELECT TOP 1 id
        FROM book_guests
        WHERE book_id = @book_id AND guest_kind_id = @g_resp_id;

        IF NOT EXISTS(SELECT * FROM @resp_guest_id_result)
            BEGIN
                THROW 51000, 'Cannot order, the book has no responsible guest!', 1;
            END

        SET @resp_guest_passport_ref = (SELECT TOP 1 passport_data
                                        FROM guests g
                                                 JOIN book_guests bg ON g.id = bg.guest_id
                                                 JOIN @resp_guest_id_result r ON r.id = bg.id);

        DECLARE
            @bill_status_id BIGINT,
            @bill_kind_id BIGINT,
            @cost MONEY = CAST(@price * @amount AS MONEY);

        SET @bill_status_id = (SELECT TOP 1 id FROM bill_statuses WHERE name = N'pending');
        SET @bill_kind_id = (SELECT TOP 1 id FROM bill_kinds WHERE name = N'product_purchase');

        INSERT INTO bills (book_id, bill_kind_id, product_id, bill_status_id, cost, recipient_ref)
        VALUES (@book_id, @bill_kind_id, @product_id, @bill_status_id, @cost, @resp_guest_passport_ref);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- list not paid bills
CREATE OR
ALTER FUNCTION list_not_paid_bills()
    RETURNS @res_table TABLE (
        hotel_id       BIGINT,
        book_id        BIGINT,
        check_out_date DATE,
        cost           MONEY,
        recipient_ref  NVARCHAR(255),
        name           NVARCHAR(255)
    ) AS
BEGIN
    INSERT INTO @res_table
    SELECT h.id AS hotel_id,
        b.id AS book_id,
        b.check_out_date AS check_out_date,
        bl.cost AS cost,
        bl.recipient_ref AS recipient_ref,
        IIF(
                blk.name = 'room_rent',
                CONCAT(N'Room rent: ', IIF(r.id IS NULL, '[data lost]', CAST(r.id AS NVARCHAR(255)))),
                IIF(bl.product_id IS NULL,
                    N'Unknown product',
                    (SELECT TOP 1 name FROM products p WHERE p.id = bl.product_id)
                    )
            ) AS name
    FROM bills bl
             JOIN bill_statuses bls ON bls.id = bl.bill_status_id AND bls.name = N'pending'
             JOIN bill_kinds blk ON bl.bill_kind_id = blk.id
             LEFT JOIN books b ON bl.book_id = b.id
             LEFT JOIN rooms r ON r.id = b.room_id
             LEFT JOIN hotels h ON h.id = r.hotel_id
    RETURN
END;
GO

-- check out (pay bills)
CREATE OR
ALTER PROCEDURE check_out @book_id BIGINT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- if it exists and approved, if that's not checked-out yet
        IF NOT EXISTS(SELECT *
                      FROM books b
                      WHERE b.id = @book_id AND b.approved = 1 AND fact_check_out IS NULL)
            BEGIN
                THROW 51000, 'Book not found!', 1;
            END

        -- if it's after check-in we can pay else we shall cancel. Check-in detects by checked-in guests
        DECLARE @bill_status_id BIGINT;
        SET @bill_status_id = (
            SELECT TOP 1 id
            FROM bill_statuses
            WHERE name = (IIF(
                        (SELECT count(*)
                         FROM book_guests bg
                                  JOIN guest_kinds gk ON bg.guest_kind_id = gk.id
                         WHERE bg.book_id = @book_id AND gk.name <> N'registered_by') > 0,
                        N'paid',
                        N'canceled'
                ))
        );

        UPDATE bills SET bill_status_id = @bill_status_id WHERE book_id = @book_id;
        UPDATE books SET fact_check_out = GETUTCDATE() WHERE id = @book_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- list tomorrow check-out
CREATE OR
ALTER FUNCTION list_who_have_check_out_tomorrow()
    RETURNS @res_table TABLE (
        book_id                     BIGINT,
        check_out_date              DATE,
        responsible_guest_id        BIGINT,
        responsible_guest_full_name NVARCHAR(MAX),
        recipient_ref               NVARCHAR(255),
        total_bill                  MONEY
    )
AS
BEGIN
    INSERT INTO @res_table
    SELECT b.id AS book_id,
        b.check_out_date AS check_out_date,
        g.id AS responsible_guest_id,
        CONCAT(g.name, IIF(g.middle_name IS NULL, N' ', CONCAT(N' ', g.middle_name, N' ')), g.sure_name) AS responsible_guest_full_name,
        g.passport_data AS recipient_ref,
            (SELECT sum(cost) FROM bills WHERE bills.book_id = b.id) AS total_bill
    FROM books b
        -- if it's canceled / paid, that means an early chek-out (besides of fact_check_out)
             JOIN (SELECT DISTINCT book_id FROM list_not_paid_bills()) unpaid ON unpaid.book_id = b.id
             JOIN guests g ON g.id = dbo.get_responsible_guest_id(b.id)
    WHERE b.approved = 1
        -- it's tomorrow or even back past, they must be checked-out ASAP!
            AND b.check_out_date <= CAST(DATEADD(DAY, 1, GETUTCDATE()) AS DATE) AND b.fact_check_out IS NULL
    RETURN
END
GO

-- a helper to get responsible guest with a fallback to registered_by
CREATE OR
ALTER FUNCTION get_responsible_guest_id(@book_id BIGINT)
    RETURNS BIGINT
AS
BEGIN
    DECLARE @resp_id BIGINT;
    SET @resp_id = (SELECT TOP 1 g.id
                    FROM guests g
                             JOIN book_guests bg ON g.id = bg.guest_id
                             JOIN guest_kinds gk ON gk.id = bg.guest_kind_id
                    WHERE bg.book_id = @book_id AND gk.name = N'responsible');
    IF @resp_id IS NULL
        BEGIN
            SET @resp_id = (SELECT TOP 1 g.id
                            FROM guests g
                                     JOIN book_guests bg ON g.id = bg.guest_id
                                     JOIN guest_kinds gk ON gk.id = bg.guest_kind_id
                            WHERE bg.book_id = @book_id AND gk.name = N'registered_by');
        END

    RETURN @resp_id
END
GO
