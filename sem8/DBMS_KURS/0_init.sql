CREATE DATABASE hotel_booking;
USE hotel_booking;

CREATE LOGIN shov WITH PASSWORD='123123QwQw';
CREATE USER shov FOR LOGIN shov;
EXEC sp_addrolemember 'db_owner', 'shov';
