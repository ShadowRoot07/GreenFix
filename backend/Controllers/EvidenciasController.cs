using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EvidenciasController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public EvidenciasController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var evidencias = await _context.Evidencias.OrderBy(e => e.EvidenciaID).ToListAsync();
        return Ok(evidencias);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var evidencias = await _context.Evidencias.Where(e => e.ProyectoID == proyectoId).ToListAsync();
        return Ok(evidencias);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Evidencia evidencia)
    {
        if (evidencia == null) return BadRequest();
        if (evidencia.FechaSubida == default) evidencia.FechaSubida = DateTime.UtcNow;
        _context.Evidencias.Add(evidencia);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = evidencia.EvidenciaID }, evidencia);
    }
}
