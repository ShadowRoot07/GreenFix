# GreenFix — Guía de ejecución local (Demo)

Sistema DeFi de microfinanciamiento corriendo **100% en local** sobre la red
de pruebas de Hardhat. No se usa ninguna red pública: contratos, cuentas y USDC
son locales.

```
contracts/  → Smart contracts (Solidity + Hardhat)
backend/    → API REST (.NET 10 + EF Core + SQL Server) — persistencia/metadata
frontend/   → SPA (React + Vite + ethers.js) — UI conectada a la blockchain
database/   → Scripts SQL Server (tablas, funciones, SPs, triggers)
```

> **La blockchain local es la fuente de verdad.** El backend solo guarda metadata
> (nombre, descripción, imagen, historial). Si el backend está apagado, el
> frontend sigue funcionando contra la cadena.

---

## 0. Requisitos

- Node.js 18+
- .NET SDK 10
- MetaMask en el navegador
- SQL Server en Windows (para el backend y la demo de base de datos)
- (Opcional) SQL Server Management Studio (SSMS) para auditar en vivo

---

# 1. Flujo crítico de ejecución (ORDEN ESTRICTO)

> 🔴 **El orden importa.** La blockchain debe estar viva y los contratos
> desplegados **antes** de abrir el frontend, porque las direcciones y los ABIs
> se generan en el despliegue. Respeta esta secuencia en 4 terminales separadas.

### Paso 1 — Nodo blockchain local (Terminal 1)

```bash
cd contracts
npm install            # solo la primera vez
npm run node           # nodo Hardhat en http://127.0.0.1:8545 (chainId 31337)
```

- **Deja esta terminal abierta todo el tiempo.** Si la cierras, mueres: se borra
  toda la blockchain (cuentas, USDC, proyectos, estados).
- Imprime 20 cuentas de prueba con sus llaves privadas y 10.000 ETH cada una.

### Paso 2 — Desplegar contratos y sincronizar (Terminal 2)

```bash
cd contracts
npm run deploy:local
```

Este script, en un solo comando, hace TODO lo necesario para sincronizar:
- Despliega `MockUSDC` (USDC de mentira, 6 decimales) y `GreenFixFactory`.
- Reparte **1.000.000 USDC** a las primeras 5 cuentas de Hardhat (faucet inicial).
- **Reescribe** `frontend/src/blockchain/contractsConfig.js` con las direcciones nuevas.
- **Copia** los ABIs a `frontend/src/blockchain/abis/`.
- Guarda un resumen en `contracts/deployments.json`.

(Opcional, recomendado antes de la presentación) Verifica el flujo completo de
punta a punta en segundos:

```bash
npx hardhat run scripts/smoke.cjs --network localhost
```

Debe terminar con `🎉 FLUJO COMPLETO OK` (crea proyecto → garantía → invierte →
milestone → vota → libera → repaga → completa → reclama).

### Paso 3 — Backend .NET (Terminal 3)

```bash
cd backend
dotnet run
```

- Corre en `http://localhost:5029`. Prueba: `GET http://localhost:5029/api/health`.
- En el arranque detecta automáticamente la IP de Windows desde WSL e imprime
  `🔌 SQL host (IP dinámica de WSL): 172.x.x.x`.
- Si SQL Server no está disponible, **el API arranca igual** (solo fallan los
  endpoints de base de datos; la cadena sigue siendo la fuente de verdad).

### Paso 4 — Frontend React (Terminal 4)

```bash
cd frontend
npm install            # solo la primera vez
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

---

## ⚠️ ALERTA CRÍTICA — Mocks, caché y reinicio del nodo

> **Reiniciar el nodo de Hardhat ROMPE la sincronización del frontend.**
> Esta es la causa #1 de errores en una demo. Léelo con atención.

### ¿Qué pasa cuando reinicias `npm run node`?

El nodo de Hardhat es **efímero y en memoria**. Cuando lo detienes (Ctrl+C) y lo
vuelves a levantar:

1. **Se borra toda la blockchain local**: desaparecen `MockUSDC`, `GreenFixFactory`,
   todos los proyectos creados, los balances de USDC y los estados de los contratos.
2. **Los contratos se redepliegan en direcciones DISTINTAS.** Hardhat asigna
   direcciones según el número de transacciones (nonce) de la cuenta, así que casi
   nunca coinciden con las del despliegue anterior.
3. El frontend, sin embargo, **sigue apuntando a las direcciones viejas** que quedaron
   escritas en `contractsConfig.js`. Resultado: errores tipo *"could not decode result
   data"*, *"contract not deployed"*, transacciones que fallan o un dashboard vacío.
4. El MockUSDC repartido (el faucet inicial) **ya no existe** en la cadena nueva.

### Regla de oro (obligatoria tras cada reinicio del nodo)

```bash
# Si reiniciaste 'npm run node', SIEMPRE vuelve a ejecutar:
cd contracts
npm run deploy:local
```

Esto regenera `contractsConfig.js` con las direcciones correctas, copia los ABIs
frescos y vuelve a repartir el MockUSDC. **Sin este paso, el frontend no funcionará.**

### Limpieza del estado del navegador (recomendado en demo)

El frontend guarda sesión, KYC y proyecto seleccionado en `localStorage`. Si ves
datos "fantasma" de una corrida anterior, límpialos:

- En la consola del navegador (F12 → Console):
  ```js
  localStorage.clear(); location.reload();
  ```
- En MetaMask, si una cuenta de prueba muestra un nonce desfasado tras reiniciar el
  nodo: **Configuración → Avanzado → Borrar datos de actividad / nonce** (Clear
  activity tab data). Esto evita el error *"nonce too high"*.

### Checklist de "arranque infalible" para la presentación

```
[ ] 1. Terminal 1: npm run node           (y NO cerrarla)
[ ] 2. Terminal 2: npm run deploy:local    (cada vez que reinicies el nodo)
[ ] 3. (opcional) npx hardhat run scripts/smoke.cjs --network localhost  → OK
[ ] 4. Terminal 3: dotnet run               (backend)
[ ] 5. Terminal 4: npm run dev              (frontend)
[ ] 6. MetaMask: red Hardhat (31337) + cuenta de prueba importada
[ ] 7. Si reiniciaste el nodo: MetaMask → Clear activity tab data
[ ] 8. localStorage.clear() en el navegador si hay datos viejos
```

---

## 5. Configurar MetaMask

1. **Agregar la red local** (el botón "Conectar Wallet" lo ofrece automáticamente, o manual):
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`

2. **Importar una cuenta de prueba** (Importar cuenta → pegar llave privada):

   | Rol sugerido | Dirección | Llave privada |
   |---|---|---|
   | Negociador (#0) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
   | Inversor (#1) | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |

   Estas cuentas ya tienen ETH (para gas) y USDC (del faucet del deploy).
   Si necesitas más USDC, usa el botón **Faucet** en la barra superior de la app.

---

## 6. Flujo de demo sugerido

**Login** (solo elige rol, auth local):
- Inversor: `inversor@gmail.com` / `12345`
- Negociador: `negociador@gmail.com` / `12345`

1. **Negociador** (cuenta #0): conecta wallet → pasa la **verificación KYC** (simulada:
   sube una foto, aprueba) → crea un proyecto (meta p.ej. 1000 USDC, elige duración
   entre 1 semana y 6 meses, pega una URL de imagen). Se despliega el contrato y se
   deposita la garantía del 5% automáticamente.
2. **Inversor** (cuenta #1): conecta wallet → entra al proyecto → invierte hasta
   completar la meta exacta (mín. 10 USDC). Usa el Faucet si te falta USDC.
3. **Negociador**: en el detalle → **Finalizar funding** (genera milestones y cuotas)
   → **Solicitar liberación** del Hito 1 (con evidencia IPFS).
4. **Inversor**: **Aprueba** la votación del milestone. Observa la **barra de quórum**:
   el peso del voto es proporcional al USDC invertido (una ballena con 60% pesa 60%).
5. **Negociador**: **Finalizar votación** → se liberan los fondos del hito.
6. **Negociador**: paga las **cuotas** una a una. Al pagar todo, el proyecto pasa a
   `Completed` (esto **dispara el trigger de auditoría** en la base de datos).
7. **Inversor**: **Reclamar recompensas** (capital + interés − fee de plataforma).

---

# 7. Base de datos SQL Server — Teoría y práctica

Esta sección explica **cómo está estructurada la persistencia**, **qué lógica de BD
se implementó** y **cómo auditarla en vivo** durante la presentación.

## 7.1 Cómo se estructuró la persistencia

GreenFix es **híbrido on-chain / off-chain**:

- **On-chain (Hardhat):** la verdad financiera — fondos en escrow, estados del
  proyecto, milestones, votos ponderados, repagos. Inmutable y verificable.
- **Off-chain (SQL Server):** **metadata e historial** que no conviene (o no se puede)
  guardar en la cadena — nombre, descripción, URL de imagen, y una **bitácora de
  auditoría** de la vida del proyecto.

El frontend, al crear un proyecto, hace dos cosas: (1) despliega el contrato y
(2) hace `POST /api/proyectos` para guardar la metadata. Cuando el dashboard carga,
lee los proyectos de la cadena y los **enriquece** con la metadata del backend
(nombre/descr./imagen) buscando por `ContractAddress`.

### Tablas principales

| Tabla | Rol |
|---|---|
| `Usuarios` | Negociadores e inversores (demo). |
| `Proyectos` | Metadata del proyecto + `ContractAddress` (puente con la cadena) + `ImagenURL` + `Estado`. |
| `Inversiones` | Registro off-chain de aportes (monto, tokens, fecha). |
| `Milestones`, `Votos`, `Pagos`, `Reembolsos`, `Recompensas`, `Evidencias` | Espejo/metadata de la actividad del protocolo. |
| `AuditoriaProyectos` | **Bitácora de auditoría**: creación y cada cambio de estado del proyecto. La alimentan el SP de registro y el trigger de estado. |

Los scripts están en `database/` y son **idempotentes** (se pueden re-ejecutar):

```
database/00_create_database.sql      → BD GreenFix + login/usuario greenfix_user
database/01_schema.sql               → todas las tablas + AuditoriaProyectos + columna ImagenURL
database/02_functions.sql            → funciones de estadística
database/03_stored_procedures.sql    → procedimientos almacenados
database/04_triggers.sql             → trigger de auditoría de estado
```

> El backend también hace **self-heal**: al arrancar, si falta la columna `ImagenURL`,
> la agrega automáticamente con un `ALTER` idempotente. Aun así, para tener las
> funciones/SPs/triggers debes ejecutar los scripts `02`, `03` y `04` una vez.

## 7.2 Lógica de base de datos implementada

### Funciones (estadísticas rápidas) — `02_functions.sql`

| Función | Qué hace |
|---|---|
| `dbo.fn_TotalRecaudadoLocal(@ProyectoID)` | Suma el `MontoInvertido` registrado off-chain para un proyecto. |
| `dbo.fn_PorcentajeFinanciado(@ProyectoID)` | % financiado respecto a la meta (`recaudado / objetivo * 100`). |
| `dbo.fn_NumeroInversores(@ProyectoID)` | Inversores únicos del proyecto. |
| `dbo.fn_EstadisticasGlobales()` | Tabla con métricas globales: total de proyectos, completados, en funding, capital solicitado, total recaudado e inversores activos. |

### Procedimientos almacenados — `03_stored_procedures.sql`

| SP | Qué hace |
|---|---|
| `dbo.usp_RegistrarProyecto` | Inserta un proyecto **y** registra la auditoría `'Creacion'` en una sola transacción (atómico). Devuelve la fila creada. |
| `dbo.usp_ActualizarEstadoProyecto` | Actualiza `Estado` y/o `MontoActual` de un proyecto. El cambio de estado lo audita el trigger automáticamente. |
| `dbo.usp_HistorialProyecto` | Devuelve la **línea de tiempo de auditoría** de un proyecto (todas sus filas en `AuditoriaProyectos`, ordenadas). Es el "ObtenerHistorialTransacciones" del sistema. |

### Trigger — `04_triggers.sql`

| Trigger | Qué hace |
|---|---|
| `dbo.trg_Proyectos_AuditarEstado` | `AFTER UPDATE` sobre `Proyectos`. Cuando **cambia el `Estado`**, inserta una fila en `AuditoriaProyectos` (estado anterior → nuevo). Si el nuevo estado es `'Completed'`, además marca `FechaFinalizacion` y usa la acción `'Completado'`. Maneja updates por lote y evita recursión. |

> **Importante para la demo:** el trigger se dispara con **cualquier** `UPDATE` del
> `Estado`, ya sea desde el SP, desde el backend (EF Core) o desde un `UPDATE` manual
> en SSMS. Por eso es tan fácil demostrarlo en vivo (ver 7.5).

## 7.3 Conectarse con SSMS (paso a paso, en Windows)

1. Abre **SQL Server Management Studio**.
2. En *Connect to Server*:
   - **Server name:** `localhost,1433`  (o `.\SQLEXPRESS` si usas esa instancia)
   - **Authentication:** `SQL Server Authentication`
   - **Login:** `greenfix_user`
   - **Password:** `GreenFix123!`
   - Marca **Trust server certificate** si lo pide.
3. Click **Connect**. En el panel izquierdo abre `Databases → GreenFix → Tables`.
4. Abre una *New Query* y asegúrate de que arriba diga la base **GreenFix**
   (o ejecuta `USE GreenFix;` primero).

> ¿Primera vez? Ejecuta los scripts en orden (`00`→`01`→`02`→`03`→`04`) desde SSMS
> (abrir archivo → F5) o con `sqlcmd` (ver `database/README.md`).

## 7.4 Consultas de demostración EN VIVO (copiar y pegar)

Ejecuta estas consultas **mientras usas el frontend** para demostrar que la metadata
se persiste al interactuar con la app.

```sql
USE GreenFix;
GO

-- (A) Demostrar que la metadata se guarda al crear un proyecto en el frontend.
--     Crea un proyecto en la app y vuelve a ejecutar esto: aparecerá la fila nueva.
SELECT ProyectoID, NombreProyecto, Estado, MontoObjetivo, MontoActual,
       ImagenURL, ContractAddress, FechaCreacion
FROM dbo.Proyectos
ORDER BY FechaCreacion DESC;
GO

-- (B) Estadísticas globales de la plataforma (función con valores de tabla).
SELECT * FROM dbo.fn_EstadisticasGlobales();
GO

-- (C) Estadísticas rápidas de un proyecto concreto (cambia el 1 por un ProyectoID real).
SELECT
    dbo.fn_TotalRecaudadoLocal(1)  AS TotalRecaudado,
    dbo.fn_PorcentajeFinanciado(1) AS PorcentajeFinanciado,
    dbo.fn_NumeroInversores(1)     AS NumeroInversores;
GO

-- (D) Historial / auditoría de transacciones de un proyecto (Stored Procedure).
EXEC dbo.usp_HistorialProyecto @ProyectoID = 1;
GO

-- (E) Ver inversiones registradas off-chain.
SELECT * FROM dbo.Inversiones ORDER BY FechaInversion DESC;
GO
```

### Registrar un proyecto desde SQL (demuestra el SP + su auditoría)

```sql
-- Inserta un proyecto Y su auditoría 'Creacion' de forma atómica.
EXEC dbo.usp_RegistrarProyecto
     @UsuarioID       = 2,
     @NombreProyecto  = 'Proyecto Demo SSMS',
     @Descripcion     = 'Creado desde SSMS para la presentación',
     @MontoObjetivo   = 1000,
     @Interes         = 6,
     @DuracionMeses   = 3,
     @Garantia        = 50,
     @ContractAddress = '0x0000000000000000000000000000000000000000',
     @ImagenURL       = 'https://picsum.photos/600';
GO

-- Verifica que la auditoría 'Creacion' quedó registrada:
SELECT TOP 5 * FROM dbo.AuditoriaProyectos ORDER BY AuditoriaID DESC;
GO
```

## 7.5 Cómo verificar que el TRIGGER se dispara (cambio de estado)

El trigger `trg_Proyectos_AuditarEstado` registra automáticamente cada cambio de
estado. Hay dos formas de demostrarlo:

### Opción A — Desde la app (lo más vistoso)
1. Toma un `ProyectoID` y mira su auditoría actual:
   ```sql
   EXEC dbo.usp_HistorialProyecto @ProyectoID = 1;
   ```
2. En el frontend, completa el flujo hasta que el proyecto pase a `Completed`
   (pagar todas las cuotas) — siempre que el backend sincronice el estado vía
   `PUT /api/proyectos/...`.
3. Vuelve a ejecutar la consulta del paso 1: verás una fila nueva con
   `Accion = 'Completado'` y la `FechaFinalizacion` seteada.

### Opción B — 100% en SQL (infalible, ideal si el backend no sincroniza estado)
Simula el cambio de estado con el SP y observa el disparo del trigger:

```sql
-- 1) Estado y auditoría ANTES
SELECT ProyectoID, Estado, FechaFinalizacion FROM dbo.Proyectos WHERE ProyectoID = 1;
EXEC dbo.usp_HistorialProyecto @ProyectoID = 1;

-- 2) Cambiar el estado (esto DISPARA el trigger)
EXEC dbo.usp_ActualizarEstadoProyecto @ProyectoID = 1, @NuevoEstado = 'Completed';
-- (también funciona un UPDATE manual:
--  UPDATE dbo.Proyectos SET Estado = 'Completed' WHERE ProyectoID = 1; )

-- 3) Estado y auditoría DESPUÉS → debe aparecer una fila 'Completado'
--    y FechaFinalizacion ya no es NULL.
SELECT ProyectoID, Estado, FechaFinalizacion FROM dbo.Proyectos WHERE ProyectoID = 1;
EXEC dbo.usp_HistorialProyecto @ProyectoID = 1;
GO
```

Resultado esperado en la auditoría tras el cambio:

```
Accion        EstadoAnterior  EstadoNuevo  Detalle
------------  --------------  -----------  ------------------------
Creacion      NULL            Funding      Proyecto "..." creado...
Completado    Funding         Completed    Estado: Funding -> Completed
```

---

## 8. Troubleshooting rápido

| Síntoma | Causa probable | Solución |
|---|---|---|
| Frontend no muestra proyectos / error al decodificar | Reiniciaste el nodo y no redeployaste | `cd contracts && npm run deploy:local` |
| `nonce too high` en MetaMask | Reiniciaste el nodo | MetaMask → Configuración → Avanzado → *Clear activity tab data* |
| Datos viejos en la UI | `localStorage` con sesión previa | Consola del navegador: `localStorage.clear()` |
| Backend: `SQL Server no disponible` | SQL Server apagado o IP de WSL no resuelta | Enciende SQL Server; o fija `Database:HostOverride` en `appsettings.json` |
| `Invalid column name 'ImagenURL'` | Esquema viejo | Reinicia el backend (self-heal) o corre `database/01_schema.sql` |
| Las funciones/SPs/trigger no existen | No corriste los scripts | Ejecuta `database/02`, `03`, `04` en SSMS |

---

## 9. Notas técnicas

- Parámetros de demo (en `contracts/scripts/deploy.cjs`): fee plataforma 10%,
  duración de votación 1 día, periodo de gracia 1 día, periodo de claim 7 días.
- `MockUSDC` usa 6 decimales, igual que el USDC real.
- El token del proyecto (`ProjectToken`) **no es transferible**: solo mint/burn.
  El peso del voto = balance de tokens = USDC invertido (1:1), por eso el quórum
  es proporcional al capital aportado.
- Conexión dinámica WSL → Windows: el backend resuelve la IP de Windows con
  `ip route | grep default` y la inyecta en el connection string. Se puede forzar
  un host con `Database:HostOverride` en `appsettings.json`.
