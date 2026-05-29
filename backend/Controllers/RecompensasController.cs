using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecompensasController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public RecompensasController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var recompensas = await _context.Recompensas.OrderBy(r => r.RecompensaID).ToListAsync();
        return Ok(recompensas);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var recompensas = await _context.Recompensas.Where(r => r.ProyectoID == proyectoId).ToListAsync();
        return Ok(recompensas);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Recompensa recompensa)
    {
        if (recompensa == null) return BadRequest();
        _context.Recompensas.Add(recompensa);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = recompensa.RecompensaID }, recompensa);
    }

    [HttpPut("{id}/reclamar")]
    public async Task<IActionResult> MarcarReclamada(int id)
    {
        var recompensa = await _context.Recompensas.FindAsync(id);
        if (recompensa == null) return NotFound();

        recompensa.Reclamada = true;
        recompensa.FechaReclamo = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(recompensa);
    }
}
