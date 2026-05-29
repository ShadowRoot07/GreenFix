/* ============================================================================
   GreenFix · 00 — Creación de base de datos y usuario
   ----------------------------------------------------------------------------
   Ejecutar EN EL SQL SERVER DE WINDOWS con un login administrador (sa).
   Idempotente: se puede correr varias veces sin error.
   ========================================================================== */

IF DB_ID('GreenFix') IS NULL
BEGIN
    CREATE DATABASE GreenFix;
    PRINT 'Base de datos GreenFix creada.';
END
ELSE
    PRINT 'Base de datos GreenFix ya existe.';
GO

-- Login a nivel de servidor (SQL auth). El backend se conecta con este usuario.
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'greenfix_user')
BEGIN
    CREATE LOGIN greenfix_user WITH PASSWORD = 'GreenFix123!', CHECK_POLICY = OFF;
    PRINT 'Login greenfix_user creado.';
END
GO

USE GreenFix;
GO

-- Usuario de base de datos mapeado al login y rol de propietario para el MVP.
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'greenfix_user')
BEGIN
    CREATE USER greenfix_user FOR LOGIN greenfix_user;
    ALTER ROLE db_owner ADD MEMBER greenfix_user;
    PRINT 'Usuario greenfix_user mapeado y agregado a db_owner.';
END
GO
