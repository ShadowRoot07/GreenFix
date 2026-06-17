using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProyectosController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public ProyectosController(GreenFixDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene todos los proyectos incluyendo hitos y pagos para el frontend.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectos()
    {
        try
        {
            var proyectos = await _context.Proyectos
                .Include(p => p.Milestones)
                .Include(p => p.Pagos)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return Ok(proyectos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener proyectos", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene un proyecto específico con sus colecciones hijas mediante su ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Proyecto>> GetProyecto(int id)
    {
        try
        {
            var proyecto = await _context.Proyectos
                .Include(p => p.Milestones)
                .Include(p => p.Pagos)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (proyecto == null)
            {
                return NotFound(new { mensaje = $"Proyecto con ID {id} no encontrado" });
            }

            return Ok(proyecto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener el proyecto", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Filtra proyectos por estado e incluye sus datos estructurados.
    /// </summary>
    [HttpGet("estado/{estado}")]
    public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectosPorEstado(string estado)
    {
        try
        {
            var proyectos = await _context.Proyectos
                .Include(p => p.Milestones)
                .Include(p => p.Pagos)
                .Where(p => p.Estado == estado)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return Ok(proyectos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al filtrar proyectos", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene un proyecto por ContractAddress mitigando problemas de Case-Sensitivity de la Blockchain.
    /// </summary>
    [HttpGet("contract/{contractAddress}")]
    public async Task<ActionResult<Proyecto>> GetProyectoPorContract(string contractAddress)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(contractAddress))
                return BadRequest(new { mensaje = "La dirección del contrato es requerida." });

            var targetAddress = contractAddress.Trim().ToLower();

            var proyecto = await _context.Proyectos
                .Include(p => p.Milestones)
                .Include(p => p.Pagos)
                .FirstOrDefaultAsync(p => p.ContractAddress.ToLower() == targetAddress);

            if (proyecto == null)
            {
                return NotFound(new { mensaje = $"Proyecto con contrato {contractAddress} no encontrado" });
            }

            return Ok(proyecto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener el proyecto por contrato", detalle = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Proyecto proyecto)
    {
        try
        {
            proyecto.FechaCreacion = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(proyecto.Estado))
                proyecto.Estado = "Funding";

            // Aseguramos formato limpio para búsquedas futuras
            if (!string.IsNullOrWhiteSpace(proyecto.ContractAddress))
                proyecto.ContractAddress = proyecto.ContractAddress.Trim();

            _context.Proyectos.Add(proyecto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProyecto), new { id = proyecto.Id }, proyecto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al crear el proyecto", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Sincroniza cambios on-chain usando el ID relacional de SQL.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Proyecto datos)
    {
        var proyecto = await _context.Proyectos.FindAsync(id);
        if (proyecto == null)
            return NotFound(new { mensaje = $"Proyecto con ID {id} no encontrado" });

        if (!string.IsNullOrWhiteSpace(datos.Estado)) proyecto.Estado = datos.Estado;
        if (datos.MontoActual > 0) proyecto.MontoActual = datos.MontoActual;
        
        if (datos.Estado == "Completed") proyecto.FechaFinalizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(proyecto);
    }

    /// <summary>
    /// Modifica el estado del proyecto buscando por su dirección de contrato de manera segura (Insensitive Case).
    /// </summary>
    [HttpPut("contract/{contractAddress}/estado")]
    public async Task<IActionResult> UpdateEstadoPorContract(string contractAddress, [FromBody] Proyecto datos)
    {
        if (string.IsNullOrWhiteSpace(contractAddress))
            return BadRequest(new { mensaje = "La dirección del contrato es requerida." });

        var targetAddress = contractAddress.Trim().ToLower();

        var proyecto = await _context.Proyectos
            .FirstOrDefaultAsync(p => p.ContractAddress.ToLower() == targetAddress);

        if (proyecto == null)
            return NotFound(new { mensaje = $"Proyecto con contrato {contractAddress} no encontrado" });

        if (!string.IsNullOrWhiteSpace(datos.Estado)) proyecto.Estado = datos.Estado;
        if (datos.MontoActual > 0) proyecto.MontoActual = datos.MontoActual;
        
        if (datos.Estado == "Completed") proyecto.FechaFinalizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(proyecto);
    }
}
