USE master;
CREATE DATABASE mydb;
USE mydb;
CREATE LOGIN shov  WITH PASSWORD = 'secretSecret1!';
CREATE USER shov FOR LOGIN shov;
EXEC sp_addrolemember 'db_owner', 'shov';
