using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InversionesController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public InversionesController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var inversiones = await _context.Inversiones.OrderBy(i => i.InversionID).ToListAsync();
        return Ok(inversiones);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var inversiones = await _context.Inversiones
            .Where(i => i.ProyectoID == proyectoId)
            .OrderByDescending(i => i.FechaInversion)
            .ToListAsync();
        return Ok(inversiones);
    }

    /// <summary>
    /// Registra una inversión on-chain en el backend resolviendo la wallet del usuario e incrementando el fondo del proyecto.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Inversion inversion)
    {
        if (inversion == null) return BadRequest(new { mensaje = "Datos de inversión inválidos." });

        // Si viene una WalletAddress desde el Front, resolvemos su UsuarioID relacional en SQL
        if (!string.IsNullOrWhiteSpace(inversion.WalletAddress))
        {
            var targetWallet = inversion.WalletAddress.Trim().ToLower();
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.WalletAddress.ToLower() == targetWallet);

            if (usuario == null)
            {
                return NotFound(new { mensaje = $"No se encontró ningún perfil registrado para la wallet: {inversion.WalletAddress}" });
            }
            inversion.UsuarioID = usuario.UsuarioID;
        }

        // Validamos que el proyecto exista
        var proyecto = await _context.Proyectos.FindAsync(inversion.ProyectoID);
        if (proyecto == null)
        {
            return NotFound(new { mensaje = $"El proyecto con ID {inversion.ProyectoID} no existe." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Insertar registro de inversión
            inversion.FechaInversion = DateTime.UtcNow;
            _context.Inversiones.Add(inversion);

            // 2. Aumentar el acumulado del proyecto de manera atómica
            proyecto.MontoActual += inversion.MontoInvertido;

            // Si se alcanza la meta, podemos actualizar el estado automáticamente a "Active" (Fase de ejecución)
            if (proyecto.MontoActual >= proyecto.MontoObjetivo && proyecto.Estado == "Funding")
            {
                proyecto.Estado = "Active";
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetAll), new { id = inversion.InversionID }, inversion);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { mensaje = "Error al procesar la inversión en base de datos", detalle = ex.Message });
        }
    }
}
