/* ============================================================================
   GreenFix · 03 — Stored Procedures (registro y auditoría)
   ----------------------------------------------------------------------------
   CREATE OR ALTER → idempotente.
   ========================================================================== */
USE GreenFix;
GO

/* usp_RegistrarProyecto
   Inserta un proyecto y registra la auditoría 'Creacion' en una sola transacción.
   Devuelve la fila del proyecto recién creado. */
CREATE OR ALTER PROCEDURE dbo.usp_RegistrarProyecto
    @UsuarioID       INT,
    @NombreProyecto  NVARCHAR(150),
    @Descripcion     NVARCHAR(MAX) = NULL,
    @MontoObjetivo   DECIMAL(18,2),
    @Interes         DECIMAL(5,2)  = 0,
    @DuracionMeses   INT           = 1,
    @Garantia        DECIMAL(18,2) = 0,
    @ContractAddress NVARCHAR(42)  = NULL,
    @ImagenURL       NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.Proyectos
            (UsuarioID, NombreProyecto, Descripcion, MontoObjetivo, MontoActual,
             Interes, DuracionMeses, Garantia, ContractAddress, Estado, ImagenURL)
        VALUES
            (@UsuarioID, @NombreProyecto, @Descripcion, @MontoObjetivo, 0,
             @Interes, @DuracionMeses, @Garantia, @ContractAddress, 'Funding', @ImagenURL);

        DECLARE @NuevoID INT = SCOPE_IDENTITY();

        INSERT INTO dbo.AuditoriaProyectos
            (ProyectoID, ContractAddress, EstadoAnterior, EstadoNuevo, MontoRecaudado, Accion, Detalle)
        VALUES
            (@NuevoID, @ContractAddress, NULL, 'Funding', 0, 'Creacion',
             CONCAT('Proyecto "', @NombreProyecto, '" creado por usuario ', @UsuarioID));

        COMMIT TRANSACTION;

        SELECT * FROM dbo.Proyectos WHERE ProyectoID = @NuevoID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

/* usp_ActualizarEstadoProyecto
   Actualiza estado y/o monto recaudado de un proyecto. El trigger de auditoría
   registra automáticamente el cambio de estado. */
CREATE OR ALTER PROCEDURE dbo.usp_ActualizarEstadoProyecto
    @ProyectoID  INT,
    @NuevoEstado NVARCHAR(30)  = NULL,
    @MontoActual DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Proyectos
    SET Estado      = COALESCE(@NuevoEstado, Estado),
        MontoActual = COALESCE(@MontoActual, MontoActual)
    WHERE ProyectoID = @ProyectoID;

    SELECT * FROM dbo.Proyectos WHERE ProyectoID = @ProyectoID;
END;
GO

/* usp_HistorialProyecto
   Devuelve la línea de tiempo de auditoría de un proyecto. */
CREATE OR ALTER PROCEDURE dbo.usp_HistorialProyecto
    @ProyectoID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT AuditoriaID, ProyectoID, ContractAddress, EstadoAnterior, EstadoNuevo,
           MontoRecaudado, Accion, Detalle, FechaEvento
    FROM dbo.AuditoriaProyectos
    WHERE ProyectoID = @ProyectoID
    ORDER BY FechaEvento ASC, AuditoriaID ASC;
END;
GO

PRINT 'Stored procedures GreenFix creados.';
GO
