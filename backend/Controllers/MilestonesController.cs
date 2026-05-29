using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MilestonesController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public MilestonesController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var milestones = await _context.Milestones.OrderBy(m => m.MilestoneID).ToListAsync();
        return Ok(milestones);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var milestones = await _context.Milestones
            .Where(m => m.ProyectoID == proyectoId)
            .OrderBy(m => m.NumeroMilestone)
            .ToListAsync();
        return Ok(milestones);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Milestone milestone)
    {
        if (milestone == null) return BadRequest();
        _context.Milestones.Add(milestone);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = milestone.MilestoneID }, milestone);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Milestone datos)
    {
        var milestone = await _context.Milestones.FindAsync(id);
        if (milestone == null) return NotFound();

        milestone.Liberado = datos.Liberado;
        if (!string.IsNullOrWhiteSpace(datos.Estado)) milestone.Estado = datos.Estado;
        if (!string.IsNullOrWhiteSpace(datos.EvidenciaURL)) milestone.EvidenciaURL = datos.EvidenciaURL;

        await _context.SaveChangesAsync();
        return Ok(milestone);
    }
}
