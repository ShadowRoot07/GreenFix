using backend.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

using System.Diagnostics; //para usar datos del sistema

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────────────────
//  Conexión dinámica WSL → SQL Server en Windows
//  ----------------------------------------------------------------------
//  Cuando el backend corre dentro de WSL, "localhost" NO apunta a Windows.
//  La IP del host Windows es la puerta de enlace por defecto de WSL, que se
//  obtiene con `ip route | grep default`. Tomamos la cadena base de
//  appsettings y le inyectamos esa IP como host (preservando puerto,
//  credenciales y demás opciones).
// ──────────────────────────────────────────────────────────────────────────

// Detecta la IP del host Windows desde WSL. Devuelve null si no la encuentra.
static string? ResolveWslHost()
{
    try
    {
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "sh",
                Arguments = "-c \"ip route | grep default | awk '{print $3}'\"",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            }
        };
        process.Start();
        string output = process.StandardOutput.ReadToEnd().Trim();
        process.WaitForExit();
        return string.IsNullOrWhiteSpace(output) ? null : output;
    }
    catch
    {
        return null; // No estamos en WSL o el comando no está disponible.
    }
}

var baseConnection = builder.Configuration.GetConnectionString("GreenFixConnection")
    ?? "Server=localhost,1433;Database=GreenFix;User Id=greenfix_user;Password=GreenFix123!;TrustServerCertificate=True;";

var csb = new SqlConnectionStringBuilder(baseConnection);

// Puerto definido en la cadena base (por defecto 1433).
var basePort = "1433";
var dataSourceParts = csb.DataSource.Split(',');
if (dataSourceParts.Length > 1) basePort = dataSourceParts[^1].Trim();

// 1) Override explícito desde configuración tiene prioridad.
var hostOverride = builder.Configuration["Database:HostOverride"];
var autoResolve = builder.Configuration.GetValue("Database:AutoResolveWslHost", true);

string resolvedHost;
if (!string.IsNullOrWhiteSpace(hostOverride))
{
    resolvedHost = hostOverride.Trim();
    Console.WriteLine($"🔌 SQL host (override de configuración): {resolvedHost}");
}
else if (autoResolve && ResolveWslHost() is string wslIp)
{
    resolvedHost = wslIp;
    Console.WriteLine($"🔌 SQL host (IP dinámica de WSL): {resolvedHost}");
}
else
{
    resolvedHost = (dataSourceParts.Length > 0 ? dataSourceParts[0] : "localhost");
    Console.WriteLine($"🔌 SQL host (cadena base): {resolvedHost}");
}

csb.DataSource = $"{resolvedHost},{basePort}";
var connectionString = csb.ConnectionString;

// Add services to the container.
builder.Services.AddControllers();
// Swagger/OpenAPI (Swashbuckle)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar Entity Framework Core con SQL Server
builder.Services.AddDbContext<GreenFixDbContext>(options =>
    options.UseSqlServer(connectionString));

// Note: Removed AddOpenApi to avoid conflicts with Swashbuckle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Aplicar migraciones automáticamente al arrancar. Si la base de datos no está
// disponible (SQL Server apagado), la app igual arranca: el frontend tolera que
// el backend no responda y la blockchain es la fuente de verdad.
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<GreenFixDbContext>();

        if (!db.Database.CanConnect())
        {
            Console.WriteLine("⚠️  SQL Server no disponible. El API arranca igual; los endpoints de BD fallarán hasta que esté disponible.");
        }
        else
        {
            if (db.Database.GetAppliedMigrations().Any())
            {
                // Hay historial de migraciones: aplicamos las pendientes con normalidad.
                db.Database.Migrate();
                Console.WriteLine("✅ Base de datos lista (migraciones al día).");
            }
            else if (db.Database.GetService<IRelationalDatabaseCreator>().HasTables())
            {
                // El esquema ya existe (creado por script SQL) pero sin historial de
                // migraciones: no migramos para no chocar con las tablas existentes.
                Console.WriteLine("ℹ️  Esquema existente detectado; se omiten las migraciones.");
            }
            else
            {
                // Base de datos vacía: creamos el esquema desde las migraciones.
                db.Database.Migrate();
                Console.WriteLine("✅ Base de datos creada desde migraciones.");
            }

            // Self-heal de columnas nuevas: garantiza que el esquema tenga las
            // columnas que el modelo espera, aunque la BD se haya creado con un
            // script SQL anterior. Idempotente y seguro (no toca si ya existe).
            db.Database.ExecuteSqlRaw(@"
                IF OBJECT_ID('dbo.Proyectos','U') IS NOT NULL
                   AND COL_LENGTH('dbo.Proyectos','ImagenURL') IS NULL
                    ALTER TABLE dbo.Proyectos ADD ImagenURL NVARCHAR(500) NULL;");
            Console.WriteLine("✅ Esquema verificado (columna ImagenURL disponible).");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️  No se pudo inicializar la base de datos: {ex.Message}");
        Console.WriteLine("    El API arrancará igual; los endpoints de BD fallarán hasta que SQL Server esté disponible.");
    }
}

// Health check simple para verificar que el API responde.
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "GreenFix API" }));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Enable Swagger (OpenAPI) middleware and UI in Development
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Only enable HTTPS redirection when the host environment is Development
// or when an HTTPS endpoint is configured. This avoids the middleware
// warning "Failed to determine the https port for redirect" when the
// app is running with only an HTTP endpoint (common in simple local runs).
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
