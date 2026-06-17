using System;

namespace backend.Models;

public class Milestone
{
    public int MilestoneID { get; set; }
    public int ProyectoID { get; set; }
    public int NumeroMilestone { get; set; }
    public int Porcentaje { get; set; }
    public decimal Monto { get; set; }
    public bool Liberado { get; set; }
    public string? EvidenciaURL { get; set; }
    public DateTime? FechaInicioVotacion { get; set; }
    public DateTime? FechaFinVotacion { get; set; }
    public string Estado { get; set; } = "Pending"; // Estandarizado a "Pending"
}
