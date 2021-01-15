USE mydb;

DROP PROCEDURE IF EXISTS add_spj;
CREATE OR
ALTER PROCEDURE add_spj @s_last_name NVARCHAR(255),
                        @p_name      NVARCHAR(255),
                        @j_name      NVARCHAR(255),
                        @amount      INT
AS
BEGIN
DECLARE @s_number INT;
SELECT @s_number = S_number FROM S WHERE last_name = @s_last_name;

IF @s_number IS NULL
        THROW 50001, 'No such S last name found!', 16;

    DECLARE @p_number INT;
SELECT @p_number = P_number FROM P WHERE name = @p_name;

IF @p_number IS NULL
        THROW 50002, 'No such P name found!', 16;

    DECLARE @j_number INT;
SELECT @j_number = J_number FROM J WHERE name = @j_name;

IF @j_number IS NULL
        THROW 50003, 'No such J name found!', 16;

INSERT INTO SPJ (S_number, P_number, J_number, amount, created_at)
VALUES (@s_number, @p_number, @j_number, @amount, getutcdate());

RETURN;
END


EXEC add_spj N'шевченко', N'Корпус 1', N'Домашний ПК', 5;
EXEC add_spj N'Кулик', N'Корпус 1', N'Домашний ПК', 4;
EXEC add_spj N'Кулик', N'Корпус 2', N'Домашний ПК', 4;


