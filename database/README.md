# GreenFix · Scripts de Base de Datos (SQL Server)

Estos scripts crean y mantienen la base de datos `GreenFix` que el backend usa
como **metadata / historial off-chain** (la blockchain sigue siendo la fuente de
verdad). Todos son **idempotentes**: se pueden ejecutar varias veces sin error.

## Orden de ejecución

| # | Archivo | Contenido |
|---|---|---|
| 00 | `00_create_database.sql` | Base de datos + login/usuario `greenfix_user` (ejecutar como `sa`). |
| 01 | `01_schema.sql` | Tablas (Usuarios, Proyectos, Inversiones, Milestones, Votos, Pagos, Reembolsos, Recompensas, Evidencias) + `AuditoriaProyectos` + columna `ImagenURL`. |
| 02 | `02_functions.sql` | Funciones de estadística: `fn_TotalRecaudadoLocal`, `fn_PorcentajeFinanciado`, `fn_NumeroInversores`, `fn_EstadisticasGlobales`. |
| 03 | `03_stored_procedures.sql` | `usp_RegistrarProyecto` (insert + auditoría), `usp_ActualizarEstadoProyecto`, `usp_HistorialProyecto`. |
| 04 | `04_triggers.sql` | `trg_Proyectos_AuditarEstado` (audita cambios de estado; marca `FechaFinalizacion` al pasar a `Completed`). |

## Cómo ejecutarlos

### Opción A — sqlcmd (desde Windows o WSL)
```bash
sqlcmd -S localhost,1433 -U sa -P "TuPasswordSa" -i 00_create_database.sql
sqlcmd -S localhost,1433 -U greenfix_user -P "GreenFix123!" -d GreenFix -i 01_schema.sql
sqlcmd -S localhost,1433 -U greenfix_user -P "GreenFix123!" -d GreenFix -i 02_functions.sql
sqlcmd -S localhost,1433 -U greenfix_user -P "GreenFix123!" -d GreenFix -i 03_stored_procedures.sql
sqlcmd -S localhost,1433 -U greenfix_user -P "GreenFix123!" -d GreenFix -i 04_triggers.sql
```

### Opción B — SSMS / Azure Data Studio
Abrir cada archivo en orden y ejecutar (F5).

## Ejemplos de uso

```sql
-- Registrar un proyecto con auditoría automática
EXEC dbo.usp_RegistrarProyecto
     @UsuarioID = 2, @NombreProyecto = 'Vivero Urbano',
     @MontoObjetivo = 1000, @Interes = 6, @DuracionMeses = 3,
     @Garantia = 50, @ContractAddress = '0xabc...', @ImagenURL = 'https://...';

-- Estadísticas rápidas
SELECT dbo.fn_TotalRecaudadoLocal(1)   AS Recaudado;
SELECT dbo.fn_PorcentajeFinanciado(1)  AS PorcentajeFinanciado;
SELECT * FROM dbo.fn_EstadisticasGlobales();

-- Disparar el trigger de auditoría (cambio de estado)
EXEC dbo.usp_ActualizarEstadoProyecto @ProyectoID = 1, @NuevoEstado = 'Completed';
EXEC dbo.usp_HistorialProyecto @ProyectoID = 1;
```

## Conexión dinámica WSL → Windows

El backend (`Program.cs`) detecta automáticamente la IP del host Windows desde
WSL (`ip route | grep default`) y la inyecta como host en el connection string.
Se puede forzar un host fijo en `appsettings.json`:

```json
"Database": {
  "AutoResolveWslHost": true,
  "HostOverride": ""   // p.ej. "localhost" o "172.20.0.1"
}
```
