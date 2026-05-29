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
    /// Obtiene la lista de todos los proyectos de la base de datos
    /// </summary>
    /// <returns>Lista de proyectos con su ContractAddress</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectos()
    {
        try
        {
            var proyectos = await _context.Proyectos
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
    /// Obtiene un proyecto específico por su ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Proyecto>> GetProyecto(int id)
    {
        try
        {
            var proyecto = await _context.Proyectos.FindAsync(id);

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
    /// Obtiene proyectos por estado (Activo, Completado, Cancelado, etc.)
    /// </summary>
    [HttpGet("estado/{estado}")]
    public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectosPorEstado(string estado)
    {
        try
        {
            var proyectos = await _context.Proyectos
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
    /// Obtiene un proyecto por su ContractAddress
    /// </summary>
    [HttpGet("contract/{contractAddress}")]
    public async Task<ActionResult<Proyecto>> GetProyectoPorContract(string contractAddress)
    {
        try
        {
            var proyecto = await _context.Proyectos
                .FirstOrDefaultAsync(p => p.ContractAddress == contractAddress);

            if (proyecto == null)
            {
                return NotFound(new { mensaje = $"Proyecto con contrato {contractAddress} no encontrado" });
            }

            return Ok(proyecto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener el proyecto", detalle = ex.Message });
        }
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Proyecto proyecto)
    {
        proyecto.FechaCreacion = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(proyecto.Estado))
            proyecto.Estado = "Funding";
        _context.Proyectos.Add(proyecto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProyecto), new { id = proyecto.Id }, proyecto);
    }

    /// <summary>
    /// Actualiza el estado on-chain del proyecto (estado y monto recaudado).
    /// Se usa para sincronizar la metadata del backend con la blockchain.
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
    /// Sincroniza el estado leído de la blockchain por dirección de contrato.
    /// </summary>
    [HttpPut("contract/{contractAddress}/estado")]
    public async Task<IActionResult> UpdateEstadoPorContract(string contractAddress, [FromBody] Proyecto datos)
    {
        var proyecto = await _context.Proyectos
            .FirstOrDefaultAsync(p => p.ContractAddress == contractAddress);
        if (proyecto == null)
            return NotFound(new { mensaje = $"Proyecto con contrato {contractAddress} no encontrado" });

        if (!string.IsNullOrWhiteSpace(datos.Estado)) proyecto.Estado = datos.Estado;
        if (datos.MontoActual > 0) proyecto.MontoActual = datos.MontoActual;

        await _context.SaveChangesAsync();
        return Ok(proyecto);
    }
}

