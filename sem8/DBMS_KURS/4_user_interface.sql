-- select free rooms from all hotels for date range
CREATE FUNCTION fetch_free_rooms_on_date_range(
    @check_in_date       DATE,
    @check_out_date      DATE,
    @guests_number       TINYINT,
    @preferred_floor     TINYINT = NULL,
    @preferred_room_kind NVARCHAR(255) = NULL,
    @preferred_options   NVARCHAR(MAX) = NULL)
    RETURNS @result_table TABLE (
        check_in_date  DATE          NOT NULL,
        check_out_date DATE          NOT NULL,
        hotel_name     NVARCHAR(255) NOT NULL,
        hotel_id       BIGINT        NOT NULL,
        room_id        BIGINT        NOT NULL,
        room_size      TINYINT       NOT NULL,
        room_kind      NVARCHAR(255) NOT NULL,
        room_options   NVARCHAR(MAX),
    ) AS
BEGIN
    IF (@check_in_date IS NULL)
        OR (@check_out_date IS NULL)
        OR (@check_in_date >= @check_out_date)
        OR (@guests_number < 1)
        BEGIN
            RAISERROR ('Wrong required input!', 16 ,1);
        END

    SET @result_table
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
