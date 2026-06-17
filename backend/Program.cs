using backend.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using System.Text.Json;
using System.Diagnostics; 

var builder = WebApplication.CreateBuilder(args);

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
        return null; 
    }
}

var baseConnection = builder.Configuration.GetConnectionString("GreenFixConnection")
    ?? "Server=localhost,1433;Database=GreenFix;User Id=greenfix_user;Password=GreenFix123!;TrustServerCertificate=True;";

var csb = new SqlConnectionStringBuilder(baseConnection);

var basePort = "1433";
var dataSourceParts = csb.DataSource.Split(',');
if (dataSourceParts.Length > 1) basePort = dataSourceParts[^1].Trim();

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

// Configurar controladores y FORZAR serialización camelCase bidireccional para React
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // Tolera mayúsculas/minúsculas del Front
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<GreenFixDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// COLOCAR CORS INMEDIATAMENTE DESPUÉS DE BUILD PARA PRE-FLIGHTS WEB3
app.UseCors("AllowAll");

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
                db.Database.Migrate();
                Console.WriteLine("✅ Base de datos lista (migraciones al día).");
            }
            else if (db.Database.GetService<IRelationalDatabaseCreator>().HasTables())
            {
                Console.WriteLine("ℹ️  Esquema existente detectado; se omiten las migraciones.");
            }
            else
            {
                db.Database.Migrate();
                Console.WriteLine("✅ Base de datos creada desde migraciones.");
            }

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
    }
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "GreenFix API" }));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
