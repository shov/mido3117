USE hotel_booking;

CREATE TABLE hotels (
    id         BIGINT IDENTITY (1,1) PRIMARY KEY,
    name       NVARCHAR(255)                             NOT NULL UNIQUE,
    stars      TINYINT CHECK (stars >= 1 AND stars <= 5) NOT NULL,
    address    NVARCHAR(255)                             NOT NULL,
    phone      NVARCHAR(255)                             NOT NULL,
    location   GEOGRAPHY                                 NOT NULL,
    created_at DATETIME DEFAULT GETUTCDATE()             NOT NULL,
    updated_at DATETIME DEFAULT NULL
);
GO

CREATE OR ALTER TRIGGER TR_hotels_after_update
    ON hotels
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE hotels
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE room_kinds (
    id         BIGINT IDENTITY (1,1) PRIMARY KEY,
    name       NVARCHAR(255)                 NOT NULL UNIQUE,
    size       TINYINT CHECK (size > 0)      NOT NULL,
    created_at DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at DATETIME DEFAULT NULL
);
GO

CREATE OR ALTER TRIGGER TR_room_kinds_after_update
    ON room_kinds
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE room_kinds
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE rooms (
    id           BIGINT IDENTITY (1,1) PRIMARY KEY,
    hotel_id     BIGINT                             NOT NULL REFERENCES hotels(id) ON UPDATE CASCADE ON DELETE CASCADE,
    room_kind_id BIGINT                             NOT NULL REFERENCES room_kinds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    floor        TINYINT CHECK (floor > 0)          NOT NULL,
    -- language=json
    options      NVARCHAR(MAX) DEFAULT '{
        "miniBar": false,
        "hairdryer": false,
        "robeAndSlippers": false
    }'                                              NOT NULL,
    night_price  MONEY                              NOT NULL,
    created_at   DATETIME      DEFAULT GETUTCDATE() NOT NULL,
    updated_at   DATETIME      DEFAULT NULL
);

CREATE INDEX IDX_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IDX_rooms_room_kind_id ON rooms(room_kind_id);
GO

CREATE OR ALTER TRIGGER TR_rooms_after_update
    ON rooms
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE rooms
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE products (
    id         BIGINT IDENTITY (1,1) PRIMARY KEY,
    hotel_id   BIGINT                        REFERENCES hotels(id) ON UPDATE CASCADE ON DELETE SET NULL,
    name       NVARCHAR(255)                 NOT NULL,
    UNIQUE (hotel_id, name),
    price      MONEY CHECK (price >= 0)      NOT NULL,
    created_at DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at DATETIME DEFAULT NULL
);
CREATE INDEX IDX_products_hotel_id ON rooms(hotel_id);
GO

CREATE OR ALTER TRIGGER TR_products_after_update
    ON products
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE products
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE OR ALTER TRIGGER TR_products_delete
    ON products
    INSTEAD OF DELETE AS
    SET NOCOUNT ON;
    UPDATE bills
    SET product_id = NULL
    WHERE product_id IN (SELECT id FROM deleted);
    DELETE
    FROM products
    WHERE id IN (SELECT id FROM deleted);
GO

CREATE TABLE books (
    id                  BIGINT IDENTITY (1,1) PRIMARY KEY,
    room_id             BIGINT                        REFERENCES rooms(id) ON UPDATE CASCADE ON DELETE SET NULL,
    check_in_date       DATE                          NOT NULL,
    check_out_date      DATE                          NOT NULL,
    late_check_out_time TIME     DEFAULT NULL,
    fact_check_in       DATETIME DEFAULT NULL,
    fact_check_out      DATETIME DEFAULT NULL,
    created_at          DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at          DATETIME DEFAULT NULL
);
CREATE INDEX IDX_books_room_id ON rooms(id);
GO

CREATE OR ALTER TRIGGER TR_books_after_update
    ON books
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE books
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE bill_statuses (
    id         BIGINT IDENTITY (1,1) PRIMARY KEY,
    name       NVARCHAR(255)                 NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at DATETIME DEFAULT NULL
);
GO

CREATE OR ALTER TRIGGER TR_bill_statuses_after_update
    ON bill_statuses
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE bill_statuses
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE bill_kinds (
    id         BIGINT IDENTITY (1,1) PRIMARY KEY,
    name       NVARCHAR(255)                 NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at DATETIME DEFAULT NULL
);
GO

CREATE OR ALTER TRIGGER TR_bill_kinds_after_update
    ON bill_kinds
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE bill_kinds
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO


CREATE TABLE bills (
    id             BIGINT IDENTITY (1,1) PRIMARY KEY,
    book_id        BIGINT                             REFERENCES books(id) ON UPDATE CASCADE ON DELETE SET NULL,
    bill_kind_id   BIGINT                             REFERENCES bill_kinds(id) ON UPDATE CASCADE ON DELETE SET NULL,
    product_id     BIGINT REFERENCES products(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
    bill_status_id BIGINT                             NOT NULL REFERENCES bill_statuses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    cost           MONEY CHECK (cost >= 0)            NOT NULL,
    recipient_ref  NVARCHAR(255) DEFAULT NULL,
    created_at     DATETIME      DEFAULT GETUTCDATE() NOT NULL,
    updated_at     DATETIME      DEFAULT NULL
);

CREATE INDEX IDX_bills_book_id ON bills(book_id);
CREATE INDEX IDX_bills_bill_kind_id ON bills(bill_kind_id);
CREATE INDEX IDX_bills_product_id ON bills(product_id);
CREATE INDEX IDX_bills_bill_status_id ON bills(bill_status_id);
GO

CREATE OR ALTER TRIGGER TR_bills_after_update
    ON bills
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE bills
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE guests (
    id            BIGINT IDENTITY (1,1) PRIMARY KEY,
    name          NVARCHAR(255)                      NOT NULL,
    sure_name     NVARCHAR(255)                      NOT NULL,
    middle_name   NVARCHAR(255) DEFAULT NULL,
    passport_data NVARCHAR(255)                      NOT NULL UNIQUE,
    created_at    DATETIME      DEFAULT GETUTCDATE() NOT NULL,
    updated_at    DATETIME      DEFAULT NULL
);
GO

CREATE OR ALTER TRIGGER TR_guests_after_update
    ON guests
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE guests
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE guest_kinds (
    id         BIGINT IDENTITY (1,1) PRIMARY KEY,
    name       NVARCHAR(255)                 NOT NULL UNIQUE,
    created_at DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at DATETIME DEFAULT NULL
);
GO

CREATE OR ALTER TRIGGER TR_guest_kinds_after_update
    ON guest_kinds
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE guest_kinds
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO

CREATE TABLE book_guests (
    id            BIGINT IDENTITY (1,1) PRIMARY KEY,
    book_id       BIGINT                        NOT NULL REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE,
    guest_id      BIGINT                        NOT NULL REFERENCES guests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    guest_kind_id BIGINT                        NOT NULL REFERENCES guest_kinds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    UNIQUE (book_id, guest_id, guest_kind_id),
    created_at    DATETIME DEFAULT GETUTCDATE() NOT NULL,
    updated_at    DATETIME DEFAULT NULL
);

CREATE INDEX IDX_book_guests_book_id ON book_guests(book_id);
CREATE INDEX IDX_book_guests_guest_id ON book_guests(guest_id);
CREATE INDEX IDX_book_guests_guest_kind_id ON book_guests(guest_kind_id);
GO

CREATE OR ALTER TRIGGER TR_book_guests_after_update
    ON book_guests
    AFTER UPDATE AS
    SET NOCOUNT ON;
    DECLARE
        @ts DATETIME = GETUTCDATE();
    UPDATE book_guests
    SET updated_at = @ts
    WHERE id IN (SELECT id FROM inserted);
GO
