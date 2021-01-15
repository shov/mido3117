USE mydb;

DROP TABLE IF EXISTS SPJ;

DROP TABLE IF EXISTS S;
CREATE TABLE S (
    S_number  INT IDENTITY (1,1) PRIMARY KEY,
    last_name NVARCHAR(255) NOT NULL UNIQUE,
    rating    INT           NOT NULL CHECK (rating >= 0 AND rating <= 10),
    city      NVARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS P;
CREATE TABLE P (
    P_number INT IDENTITY (1,1) PRIMARY KEY,
    name     NVARCHAR(255) NOT NULL UNIQUE,
    colour   NVARCHAR(63),
    weight   REAL          NOT NULL CHECK (weight > 0),
    city     NVARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS J;
CREATE TABLE J (
    J_number INT IDENTITY (1,1) PRIMARY KEY,
    name     NVARCHAR(255) NOT NULL UNIQUE,
    city     NVARCHAR(255) NOT NULL
);

CREATE TABLE SPJ (
    S_number   INT      NOT NULL REFERENCES S ON DELETE CASCADE,
    P_number   INT      NOT NULL REFERENCES P ON DELETE CASCADE,
    J_number   INT      NOT NULL REFERENCES J ON DELETE CASCADE,
    amount     INT      NOT NULL CHECK (amount > 0),
    created_at DATETIME NOT NULL,
    UNIQUE (S_number, P_number, J_number, created_at)
);

INSERT INTO S (last_name, rating, city)
VALUES (N'Шевченко', 9, N'Минск'),
    (N'Кулик', 10, N'Киев');

INSERT INTO P (name, colour, weight, city)
VALUES (N'Корпус 1', N'Бежевый', 1.7, N'Минск'),
    (N'Блок питания', NULL, 0.8, N'Москва');

INSERT INTO J (name, city)
VALUES (N'Домашний ПК', N'Минск'),
    (N'Офисный ПК', N'Минск');
