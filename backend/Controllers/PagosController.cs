using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public PagosController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var pagos = await _context.Pagos.OrderBy(p => p.PagoID).ToListAsync();
        return Ok(pagos);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var pagos = await _context.Pagos
            .Where(p => p.ProyectoID == proyectoId)
            .OrderBy(p => p.NumeroCuota)
            .ToListAsync();
        return Ok(pagos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Pago pago)
    {
        if (pago == null) return BadRequest();
        _context.Pagos.Add(pago);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = pago.PagoID }, pago);
    }

    [HttpPut("{id}/pagar")]
    public async Task<IActionResult> MarcarPagado(int id)
    {
        var pago = await _context.Pagos.FindAsync(id);
        if (pago == null) return NotFound();

        pago.Pagado = true;
        pago.FechaPago = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(pago);
    }
}
