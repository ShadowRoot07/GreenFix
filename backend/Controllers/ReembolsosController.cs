using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReembolsosController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public ReembolsosController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reembolsos = await _context.Reembolsos.OrderBy(r => r.ReembolsoID).ToListAsync();
        return Ok(reembolsos);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var reembolsos = await _context.Reembolsos.Where(r => r.ProyectoID == proyectoId).ToListAsync();
        return Ok(reembolsos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Reembolso reembolso)
    {
        if (reembolso == null) return BadRequest();
        _context.Reembolsos.Add(reembolso);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = reembolso.ReembolsoID }, reembolso);
    }
}
