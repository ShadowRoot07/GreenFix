using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VotosController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public VotosController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var votos = await _context.Votos.OrderBy(v => v.VotoID).ToListAsync();
        return Ok(votos);
    }

    [HttpGet("milestone/{milestoneId}")]
    public async Task<IActionResult> GetByMilestone(int milestoneId)
    {
        var votos = await _context.Votos.Where(v => v.MilestoneID == milestoneId).ToListAsync();
        return Ok(votos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Voto voto)
    {
        if (voto == null) return BadRequest();
        _context.Votos.Add(voto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = voto.VotoID }, voto);
    }
}
