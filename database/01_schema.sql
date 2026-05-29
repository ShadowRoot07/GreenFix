/* ============================================================================
   GreenFix · 01 — Esquema de tablas (metadata off-chain)
   ----------------------------------------------------------------------------
   La blockchain es la fuente de verdad; estas tablas guardan metadata, historial
   y auditoría. Los nombres de columnas coinciden con el mapeo de EF Core
   (GreenFixDbContext) para que el backend funcione sin cambios.
   Idempotente: crea lo que falte y agrega columnas nuevas con ALTER seguro.
   ========================================================================== */
USE GreenFix;
GO

/* ─────────────── Usuarios ─────────────── */
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
CREATE TABLE dbo.Usuarios (
    UsuarioID      INT IDENTITY(1,1) PRIMARY KEY,
    Nombre         NVARCHAR(100)  NOT NULL,
    Email          NVARCHAR(150)  NOT NULL,
    WalletAddress  NVARCHAR(255)  NOT NULL,
    TipoUsuario    NVARCHAR(20)   NOT NULL,
    FechaRegistro  DATETIME2      NOT NULL DEFAULT (GETDATE())
);
GO

/* ─────────────── Proyectos ─────────────── */
IF OBJECT_ID('dbo.Proyectos', 'U') IS NULL
CREATE TABLE dbo.Proyectos (
    ProyectoID         INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID          INT            NOT NULL,
    NombreProyecto     NVARCHAR(150)  NOT NULL,
    Descripcion        NVARCHAR(MAX)  NULL,
    MontoObjetivo      DECIMAL(18,2)  NOT NULL DEFAULT (0),
    MontoActual        DECIMAL(18,2)  NOT NULL DEFAULT (0),
    Interes            DECIMAL(5,2)   NOT NULL DEFAULT (0),
    DuracionMeses      INT            NOT NULL DEFAULT (1),
    Garantia           DECIMAL(18,2)  NOT NULL DEFAULT (0),
    ContractAddress    NVARCHAR(42)   NULL,
    Estado             NVARCHAR(30)   NOT NULL DEFAULT ('Funding'),
    FechaCreacion      DATETIME2      NOT NULL DEFAULT (GETDATE()),
    FechaFinalizacion  DATETIME2      NULL,
    CONSTRAINT FK_Proyectos_Usuarios FOREIGN KEY (UsuarioID)
        REFERENCES dbo.Usuarios (UsuarioID) ON DELETE CASCADE
);
GO

-- Columna nueva: URL de imagen personalizada del proyecto (feature del negociador).
IF COL_LENGTH('dbo.Proyectos', 'ImagenURL') IS NULL
    ALTER TABLE dbo.Proyectos ADD ImagenURL NVARCHAR(500) NULL;
GO

/* ─────────────── Inversiones ─────────────── */
IF OBJECT_ID('dbo.Inversiones', 'U') IS NULL
CREATE TABLE dbo.Inversiones (
    InversionID     INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID      INT            NOT NULL,
    UsuarioID       INT            NOT NULL,
    MontoInvertido  DECIMAL(18,2)  NOT NULL,
    TokensAsignados DECIMAL(18,2)  NOT NULL,
    FechaInversion  DATETIME2      NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Inversiones_Proyectos FOREIGN KEY (ProyectoID) REFERENCES dbo.Proyectos (ProyectoID),
    CONSTRAINT FK_Inversiones_Usuarios  FOREIGN KEY (UsuarioID)  REFERENCES dbo.Usuarios (UsuarioID)
);
GO

/* ─────────────── Milestones ─────────────── */
IF OBJECT_ID('dbo.Milestones', 'U') IS NULL
CREATE TABLE dbo.Milestones (
    MilestoneID         INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID          INT            NOT NULL,
    NumeroMilestone     INT            NOT NULL,
    Porcentaje          INT            NOT NULL,
    Monto               DECIMAL(18,2)  NOT NULL,
    Liberado            BIT            NOT NULL DEFAULT (0),
    EvidenciaURL        NVARCHAR(500)  NULL,
    FechaInicioVotacion DATETIME2      NULL,
    FechaFinVotacion    DATETIME2      NULL,
    Estado              NVARCHAR(20)   NOT NULL DEFAULT ('Pendiente'),
    CONSTRAINT FK_Milestones_Proyectos FOREIGN KEY (ProyectoID) REFERENCES dbo.Proyectos (ProyectoID)
);
GO

/* ─────────────── Votos ─────────────── */
IF OBJECT_ID('dbo.Votos', 'U') IS NULL
CREATE TABLE dbo.Votos (
    VotoID      INT IDENTITY(1,1) PRIMARY KEY,
    MilestoneID INT            NOT NULL,
    UsuarioID   INT            NOT NULL,
    VotoValor   BIT            NOT NULL,
    PesoVoto    DECIMAL(18,2)  NOT NULL,
    FechaVoto   DATETIME2      NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Votos_Milestones FOREIGN KEY (MilestoneID) REFERENCES dbo.Milestones (MilestoneID),
    CONSTRAINT FK_Votos_Usuarios   FOREIGN KEY (UsuarioID)   REFERENCES dbo.Usuarios (UsuarioID)
);
GO

/* ─────────────── Pagos ─────────────── */
IF OBJECT_ID('dbo.Pagos', 'U') IS NULL
CREATE TABLE dbo.Pagos (
    PagoID       INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID   INT            NOT NULL,
    NumeroCuota  INT            NOT NULL,
    MontoPago    DECIMAL(18,2)  NOT NULL,
    FechaLimite  DATETIME2      NOT NULL,
    Pagado       BIT            NOT NULL DEFAULT (0),
    FechaPago    DATETIME2      NULL,
    CONSTRAINT FK_Pagos_Proyectos FOREIGN KEY (ProyectoID) REFERENCES dbo.Proyectos (ProyectoID)
);
GO

/* ─────────────── Reembolsos ─────────────── */
IF OBJECT_ID('dbo.Reembolsos', 'U') IS NULL
CREATE TABLE dbo.Reembolsos (
    ReembolsoID     INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID      INT            NOT NULL,
    UsuarioID       INT            NOT NULL,
    MontoReembolso  DECIMAL(18,2)  NOT NULL,
    FechaReembolso  DATETIME2      NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Reembolsos_Proyectos FOREIGN KEY (ProyectoID) REFERENCES dbo.Proyectos (ProyectoID),
    CONSTRAINT FK_Reembolsos_Usuarios  FOREIGN KEY (UsuarioID)  REFERENCES dbo.Usuarios (UsuarioID)
);
GO

/* ─────────────── Recompensas ─────────────── */
IF OBJECT_ID('dbo.Recompensas', 'U') IS NULL
CREATE TABLE dbo.Recompensas (
    RecompensaID   INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID     INT            NOT NULL,
    UsuarioID      INT            NOT NULL,
    MontoGanancia  DECIMAL(18,2)  NOT NULL,
    Reclamada      BIT            NOT NULL DEFAULT (0),
    FechaReclamo   DATETIME2      NULL,
    CONSTRAINT FK_Recompensas_Proyectos FOREIGN KEY (ProyectoID) REFERENCES dbo.Proyectos (ProyectoID),
    CONSTRAINT FK_Recompensas_Usuarios  FOREIGN KEY (UsuarioID)  REFERENCES dbo.Usuarios (UsuarioID)
);
GO

/* ─────────────── Evidencias ─────────────── */
IF OBJECT_ID('dbo.Evidencias', 'U') IS NULL
CREATE TABLE dbo.Evidencias (
    EvidenciaID  INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID   INT            NOT NULL,
    Titulo       NVARCHAR(200)  NULL,
    ArchivoURL   NVARCHAR(500)  NOT NULL,
    TipoArchivo  NVARCHAR(50)   NULL,
    FechaSubida  DATETIME2      NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Evidencias_Proyectos FOREIGN KEY (ProyectoID) REFERENCES dbo.Proyectos (ProyectoID)
);
GO

/* ─────────────── AuditoriaProyectos (NUEVA: historial/auditoría) ───────────────
   Registra creación y cada cambio de estado de un proyecto. La alimentan el
   stored procedure de registro y el trigger de cambio de estado.
*/
IF OBJECT_ID('dbo.AuditoriaProyectos', 'U') IS NULL
CREATE TABLE dbo.AuditoriaProyectos (
    AuditoriaID      INT IDENTITY(1,1) PRIMARY KEY,
    ProyectoID       INT            NOT NULL,
    ContractAddress  NVARCHAR(42)   NULL,
    EstadoAnterior   NVARCHAR(30)   NULL,
    EstadoNuevo      NVARCHAR(30)   NULL,
    MontoRecaudado   DECIMAL(18,2)  NULL,
    Accion           NVARCHAR(50)   NOT NULL,   -- 'Creacion' | 'CambioEstado' | 'Completado'
    Detalle          NVARCHAR(500)  NULL,
    FechaEvento      DATETIME2      NOT NULL DEFAULT (SYSUTCDATETIME())
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Auditoria_Proyecto' AND object_id = OBJECT_ID('dbo.AuditoriaProyectos'))
    CREATE NONCLUSTERED INDEX IX_Auditoria_Proyecto
        ON dbo.AuditoriaProyectos (ProyectoID, FechaEvento);
GO

PRINT 'Esquema GreenFix listo.';
GO
