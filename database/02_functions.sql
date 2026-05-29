/* ============================================================================
   GreenFix · 02 — Funciones (estadísticas rápidas)
   ----------------------------------------------------------------------------
   CREATE OR ALTER → idempotente (SQL Server 2016 SP1+).
   ========================================================================== */
USE GreenFix;
GO

/* fn_TotalRecaudadoLocal: total invertido (off-chain) registrado para un proyecto. */
CREATE OR ALTER FUNCTION dbo.fn_TotalRecaudadoLocal (@ProyectoID INT)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @total DECIMAL(18,2);
    SELECT @total = ISNULL(SUM(MontoInvertido), 0)
    FROM dbo.Inversiones
    WHERE ProyectoID = @ProyectoID;
    RETURN @total;
END;
GO

/* fn_PorcentajeFinanciado: % financiado respecto a la meta del proyecto. */
CREATE OR ALTER FUNCTION dbo.fn_PorcentajeFinanciado (@ProyectoID INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @objetivo DECIMAL(18,2), @recaudado DECIMAL(18,2);

    SELECT @objetivo = MontoObjetivo FROM dbo.Proyectos WHERE ProyectoID = @ProyectoID;
    SET @recaudado = dbo.fn_TotalRecaudadoLocal(@ProyectoID);

    IF @objetivo IS NULL OR @objetivo = 0 RETURN 0;
    RETURN CAST(ROUND((@recaudado / @objetivo) * 100, 2) AS DECIMAL(5,2));
END;
GO

/* fn_NumeroInversores: cantidad de inversores únicos de un proyecto. */
CREATE OR ALTER FUNCTION dbo.fn_NumeroInversores (@ProyectoID INT)
RETURNS INT
AS
BEGIN
    DECLARE @n INT;
    SELECT @n = COUNT(DISTINCT UsuarioID) FROM dbo.Inversiones WHERE ProyectoID = @ProyectoID;
    RETURN ISNULL(@n, 0);
END;
GO

/* fn_EstadisticasGlobales: una fila con métricas globales de la plataforma. */
CREATE OR ALTER FUNCTION dbo.fn_EstadisticasGlobales ()
RETURNS TABLE
AS
RETURN
(
    SELECT
        (SELECT COUNT(*) FROM dbo.Proyectos)                                   AS TotalProyectos,
        (SELECT COUNT(*) FROM dbo.Proyectos WHERE Estado = 'Completed')        AS ProyectosCompletados,
        (SELECT COUNT(*) FROM dbo.Proyectos WHERE Estado = 'Funding')          AS ProyectosEnFunding,
        (SELECT ISNULL(SUM(MontoObjetivo), 0) FROM dbo.Proyectos)              AS CapitalSolicitado,
        (SELECT ISNULL(SUM(MontoInvertido), 0) FROM dbo.Inversiones)           AS TotalRecaudado,
        (SELECT COUNT(DISTINCT UsuarioID) FROM dbo.Inversiones)                AS InversoresActivos
);
GO

PRINT 'Funciones GreenFix creadas.';
GO
