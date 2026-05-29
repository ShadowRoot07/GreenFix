namespace backend.Models;

public class Proyecto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal MontoObjetivo { get; set; }
    public decimal MontoActual { get; set; }
    public decimal Interes { get; set; }           // ← NUEVO
    public int DuracionMeses { get; set; }         // ← NUEVO
    public decimal Garantia { get; set; }          // ← NUEVO
    public string? ImagenURL { get; set; }          // ← URL de imagen personalizada
    public string ContractAddress { get; set; } = string.Empty;
    public string Estado { get; set; } = "Funding";
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaFinalizacion { get; set; }
    public int EmprendedorId { get; set; }
}
