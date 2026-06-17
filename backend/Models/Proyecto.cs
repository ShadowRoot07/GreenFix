namespace backend.Models;

public class Proyecto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal MontoObjetivo { get; set; }
    public decimal MontoActual { get; set; }
    public decimal Interes { get; set; }           
    public int DuracionMeses { get; set; }         
    public decimal Garantia { get; set; }          
    public string? ImagenURL { get; set; }          
    public string ContractAddress { get; set; } = string.Empty;
    public string Estado { get; set; } = "Funding"; 
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaFinalizacion { get; set; }
    public int EmprendedorId { get; set; }

    // ==========================================
    // PROPIEDADES DE NAVEGACIÓN (Evitan consultas fragmentadas)
    // ==========================================
    public virtual ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    public virtual ICollection<Inversion> Inversiones { get; set; } = new List<Inversion>();
}
