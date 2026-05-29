/* ============================================================================
   GreenFix · 04 — Triggers (auditoría de cambios de estado)
   ----------------------------------------------------------------------------
   CREATE OR ALTER → idempotente.
   ========================================================================== */
USE GreenFix;
GO

/* trg_Proyectos_AuditarEstado
   AFTER UPDATE: cuando cambia el Estado de un proyecto, registra una fila en
   AuditoriaProyectos. Si el nuevo estado es 'Completed', además marca la
   FechaFinalizacion y usa la acción 'Completado'.

   Maneja actualizaciones por lotes (varias filas) vía inserted/deleted.
   La recursión directa de triggers está desactivada por defecto en SQL Server,
   y el UPDATE de FechaFinalizacion se acota a la transición real, evitando
   cualquier ciclo. */
CREATE OR ALTER TRIGGER dbo.trg_Proyectos_AuditarEstado
ON dbo.Proyectos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Solo actuamos si la columna Estado fue parte del UPDATE.
    IF NOT UPDATE(Estado) RETURN;

    -- 1) Auditar cada proyecto cuyo estado realmente cambió.
    INSERT INTO dbo.AuditoriaProyectos
        (ProyectoID, ContractAddress, EstadoAnterior, EstadoNuevo, MontoRecaudado, Accion, Detalle)
    SELECT
        i.ProyectoID,
        i.ContractAddress,
        d.Estado,
        i.Estado,
        i.MontoActual,
        CASE WHEN i.Estado = 'Completed' THEN 'Completado' ELSE 'CambioEstado' END,
        CONCAT('Estado: ', d.Estado, ' -> ', i.Estado)
    FROM inserted i
    INNER JOIN deleted d ON i.ProyectoID = d.ProyectoID
    WHERE ISNULL(i.Estado, '') <> ISNULL(d.Estado, '');

    -- 2) Al pasar a 'Completed', fijar FechaFinalizacion (solo en la transición).
    UPDATE p
    SET p.FechaFinalizacion = SYSUTCDATETIME()
    FROM dbo.Proyectos p
    INNER JOIN inserted i ON p.ProyectoID = i.ProyectoID
    INNER JOIN deleted  d ON p.ProyectoID = d.ProyectoID
    WHERE i.Estado = 'Completed'
      AND ISNULL(d.Estado, '') <> 'Completed'
      AND p.FechaFinalizacion IS NULL;
END;
GO

PRINT 'Triggers GreenFix creados.';
GO
