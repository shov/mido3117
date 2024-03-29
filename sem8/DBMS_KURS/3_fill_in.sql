USE hotel_booking;
GO

-- room kinds
INSERT INTO room_kinds (name, size)
VALUES (N'Single', 1),
    (N'Double', '2'),
    (N'Triple', 3),
    (N'Quad', 4),
    (N'Queen', 2),
    (N'King', 5),
    (N'Twin', 2),
    (N'Double-double', 4),
    (N'Studio', 6);

-- guest kinds
INSERT INTO guest_kinds (name)
VALUES (N'registered_by'),
    (N'responsible'),
    (N'regular');

-- bill kinds
INSERT INTO bill_kinds (name)
VALUES (N'room_rent'),
    (N'product_purchase');

-- bill statuses
INSERT INTO bill_statuses (name)
VALUES (N'pending'),
    (N'canceled'),
    (N'paid');
GO

-- fill in hotels
INSERT INTO hotels (name, stars, address, phone, location)
VALUES (N'Sport', 3, N'улица Якуба Коласа, 35', N'+375 555 55 55', GEOGRAPHY::STGeomFromText('POINT(53.925168 27.592095)', 4326)),
(N'Holiday Inn, Šeimyniškių', 4, N'Šeimyniškių g. 1, Vilnius 09312, Lithuania', N'+375 555 66 66',
 GEOGRAPHY::STGeomFromText('POINT(54.694357 25.282185)', 4326)),
(N'Radisson Blue, Konstitucijos', 3, N'Konstitucijos pr. 20, Vilnius 09308, Lithuania', N'+375 555 77 77',
 GEOGRAPHY::STGeomFromText('POINT(54.695284 25.275107)', 4326))
GO

-- fill in rooms by hotel name
CREATE OR
ALTER PROCEDURE fill_rooms_for_hotel @hotel_name     NVARCHAR(255),
                                     @room_kind_name NVARCHAR(255),
                                     @number         TINYINT,
                                     @floor          TINYINT,
                                     @room_options   NVARCHAR(MAX),
                                     @room_price     MONEY
AS
BEGIN
    BEGIN TRANSACTION
        BEGIN TRY
            IF @number < 1
                BEGIN
                    THROW 51000, 'Cannot insert less than 1 room', 1;
                END;
            IF @floor < 1
                BEGIN
                    THROW 51000, 'Floor must be a positive', 1;
                END;

            IF @room_price < 0
                BEGIN
                    THROW 51000, 'Price must not be negative', 1;
                END;

            IF (@room_options IS NOT NULL) AND (ISJSON(@room_options) < 1)
                BEGIN
                    THROW 51000, 'Options must be NULL a valid JSON string', 1;
                END;

            IF NOT EXISTS(SELECT * FROM hotels WHERE name = @hotel_name)
                BEGIN
                    THROW 51000, 'Hotel not found', 1;
                END;

            IF NOT EXISTS(SELECT * FROM room_kinds WHERE name = @room_kind_name)
                BEGIN
                    THROW 51000, 'Room kind not found', 1;
                END;

            DECLARE @hotel_id BIGINT = (SELECT TOP 1 id FROM hotels WHERE name = @hotel_name);
            DECLARE @room_kind_id BIGINT = (SELECT TOP 1 id FROM room_kinds WHERE name = @room_kind_name);
            DECLARE @forCount TINYINT = 0;
            WHILE (@number > @forCount)
                BEGIN
                    INSERT INTO rooms (hotel_id, room_kind_id, floor, night_price, options)
                    VALUES (@hotel_id, @room_kind_id,
                            @floor, @room_price, @room_options);
                    SET @forCount = @forCount + 1;
                END;
            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;

            THROW;
        END CATCH
END;
GO

EXEC fill_rooms_for_hotel N'Sport', N'Single', 10, 1,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": false,
         "robeAndSlippers": false
     }',
     120.00;

EXEC fill_rooms_for_hotel N'Sport', N'Twin', 10, 2,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": false
     }',
     200.00;

EXEC fill_rooms_for_hotel N'Holiday Inn, Šeimyniškių', N'Single', 5, 1,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": true
     }',
     210.00;

EXEC fill_rooms_for_hotel N'Holiday Inn, Šeimyniškių', N'Double', 5, 1,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": true
     }',
     400.00;

EXEC fill_rooms_for_hotel N'Radisson Blue, Konstitucijos', N'Single', 5, 1,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": true
     }',
     300.00;

EXEC fill_rooms_for_hotel N'Radisson Blue, Konstitucijos', N'Double', 10, 2,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": true
     }',
     300.00;

EXEC fill_rooms_for_hotel N'Radisson Blue, Konstitucijos', N'Queen', 2, 15,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": true
     }',
     1000.00;

EXEC fill_rooms_for_hotel N'Radisson Blue, Konstitucijos', N'King', 1, 15,
    -- language=json
     N'{
         "miniBar": true,
         "hairdryer": true,
         "robeAndSlippers": true
     }',
     1500.00;


-- fill in products by hotel name
CREATE OR
ALTER PROCEDURE fill_products_for_hotel @hotel_name   NVARCHAR(255),
                                        @product_name NVARCHAR(255),
                                        @price        MONEY
AS
BEGIN
    DECLARE @hotel_id_res TABLE (
        id BIGINT
    );
    INSERT INTO @hotel_id_res SELECT id FROM hotels WHERE name = @hotel_name;

    IF NOT EXISTS(SELECT * FROM @hotel_id_res)
        BEGIN
            THROW 51000, 'Hotel not found!', 1;
        END;

    DECLARE @hotel_id BIGINT;
    SET @hotel_id = (SELECT TOP 1 id FROM @hotel_id_res);

    IF EXISTS(SELECT * FROM products WHERE hotel_id = @hotel_id AND name = @product_name)
        BEGIN
            THROW 51000, 'Product with this name is already existing!', 1;
        END

    INSERT INTO products (hotel_id, name, price) VALUES (@hotel_id, @product_name, @price);
END;
GO

EXEC fill_products_for_hotel N'Sport', N'Breakfast', 40;
EXEC fill_products_for_hotel N'Sport', N'Cola 0.5', 8;
EXEC fill_products_for_hotel N'Sport', N'Parking day', 50;
