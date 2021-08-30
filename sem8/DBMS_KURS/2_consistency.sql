USE hotel_booking;

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
    IF NOT EXISTS(
            SELECT *
            FROM inserted i
                     JOIN book_guests bg ON i.id = bg.book_id
                     JOIN guests g ON bg.guest_id = g.id
                     JOIN guest_kinds gk ON gk.id = bg.guest_kind_id
                     JOIN bills b ON i.id = b.book_id
                     JOIN bill_kinds bk ON b.bill_kind_id = bk.id
            WHERE gk.name IN (N'registered_by', N'responsible') AND bk.name = N'room_rent'
        )
        BEGIN
            RAISERROR ('Cannot have a book without room_rent bill and at least one responsible either registered_by guest!', 16, 1);
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
-- a bill cannot be updated if paid or canceled if a book has neither responsible nor registered_by guest
-- a bill cannot be updated as paid without passport_ref, it must belong a responsible or else be of registered_by
-- a bill cannot be updated as paid with registered by if responsible exists
-- a bill cannot be inserted with product id if kind of it is rent_room
-- a bill cannot be inserted with kind of rent_room more then twice for the same book_id
-- a bill cannot be inserted without product_id if kind is product_purchase


