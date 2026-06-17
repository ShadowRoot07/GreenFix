using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Inversion
{
    public int InversionID { get; set; }
    public int ProyectoID { get; set; }
    public int UsuarioID { get; set; }
    public decimal MontoInvertido { get; set; }
    public decimal TokensAsignados { get; set; }
    public DateTime FechaInversion { get; set; } = DateTime.UtcNow;

    // Propiedad auxiliar que no se mapea en la tabla, solo sirve para el transporte desde React
    [NotMapped]
    public string? WalletAddress { get; set; }
}
