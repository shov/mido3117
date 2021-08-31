USE hotel_booking;
GO

-- book cannot exists without a guest and without at least one room_rent bill out of a transaction

CREATE OR ALTER TRIGGER TR_books_insert_update
    ON books
    AFTER INSERT, UPDATE
    AS
    SET NOCOUNT ON;
    IF EXISTS(SELECT *
              FROM inserted i
              WHERE check_in_date >= check_out_date)
        BEGIN
            RAISERROR ('Check-in date cannot be the same or late than check-out one!', 16, 1);
        END;

    IF EXISTS(SELECT *
              FROM inserted i
                       JOIN books b ON
                      b.room_id = i.room_id
                      AND b.id <> i.id
                      AND ((i.check_in_date < b.check_out_date) AND (i.check_out_date > b.check_in_date)))
        BEGIN
            RAISERROR ('Wanted interval crosses already booked!', 16, 1);
        END;

    IF (
           SELECT COUNT(*)
           FROM inserted i
                    JOIN inserted ai ON i.id = ai.id AND ai.approved = 1
       ) <> (SELECT COUNT(*)
             FROM inserted i
                      JOIN inserted ai ON i.id = ai.id AND ai.approved = 1
                      JOIN book_guests bg ON i.id = bg.book_id
                      JOIN guests g ON bg.guest_id = g.id
                      JOIN bills b ON i.id = b.book_id
                      JOIN bill_kinds bk ON b.bill_kind_id = bk.id
                      JOIN guest_kinds gk ON gk.id = bg.guest_kind_id
             WHERE gk.name IN (N'registered_by', N'responsible') AND bk.name = N'room_rent')
        BEGIN
            RAISERROR ('Cannot have an approved book without room_rent bill and at least one responsible either registered_by guest!', 16, 1);
        END;
GO

-- book_guests of not registered_by cannot be more than room size allows
-- book_guests responsible cannot be inserted if one already exists
-- book_guests registered_by cannot be inserted if one already exists
-- book_guests regular cannot be inserted if no responsible
-- book_guests responsible cannot be removed if there are at leas one regular
--    CREATE OR ALTER TRIGGER TR_book_guests_insert ON book_guests INSTEAD OF INSERT


-- a bill cannot be inserted if a book has neither responsible nor registered_by guest
-- a bill cannot be inserted with not pending status
-- a bill cannot be updated if paid or canceled if a book has neither responsible nor registered_by guest nor book is approved
-- a bill cannot be updated as paid without passport_ref, it must belong a responsible or else be of registered_by and book must be approved
-- a bill cannot be updated as paid with registered by if responsible exists and book must be approved
-- a bill cannot be inserted with product id if kind of it is rent_room
-- a bill cannot be inserted with kind of rent_room more then twice for the same book_id
-- a bill cannot be inserted without product_id if kind is product_purchase


