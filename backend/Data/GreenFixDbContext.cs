using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class GreenFixDbContext : DbContext
{
    public GreenFixDbContext(DbContextOptions<GreenFixDbContext> options) : base(options)
    {
    }

    public DbSet<Proyecto> Proyectos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Inversion> Inversiones { get; set; }
    public DbSet<Milestone> Milestones { get; set; }
    public DbSet<Voto> Votos { get; set; }
    public DbSet<Pago> Pagos { get; set; }
    public DbSet<Reembolso> Reembolsos { get; set; }
    public DbSet<Recompensa> Recompensas { get; set; }
    public DbSet<Evidencia> Evidencias { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map entities to existing SQL schema (table names and columns used in the provided SQL)
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.HasKey(e => e.UsuarioID);
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.WalletAddress).IsRequired().HasMaxLength(255);
            entity.Property(e => e.TipoUsuario).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("GETDATE()");
        });

        modelBuilder.Entity<Proyecto>(entity =>
        {
            entity.ToTable("Proyectos");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("ProyectoID");
            entity.Property(e => e.EmprendedorId).HasColumnName("UsuarioID");
            entity.Property(e => e.Nombre).HasColumnName("NombreProyecto").IsRequired().HasMaxLength(150);
            entity.Property(e => e.Descripcion).HasColumnName("Descripcion");
            entity.Property(e => e.MontoObjetivo).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MontoActual).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Interes).HasColumnType("decimal(5,2)");        // ← NUEVO
            entity.Property(e => e.DuracionMeses).IsRequired();               // ← NUEVO
            entity.Property(e => e.Garantia).HasColumnType("decimal(18,2)");      // ← NUEVO
            entity.Property(e => e.ImagenURL).HasColumnName("ImagenURL").HasMaxLength(500); // ← imagen personalizada
            entity.Property(e => e.ContractAddress).HasMaxLength(42);         // ← AGREGAR config
            entity.Property(e => e.Estado).HasMaxLength(30).HasDefaultValue("Funding");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
            // FK
            entity.HasOne<Usuario>().WithMany().HasForeignKey("UsuarioID").HasPrincipalKey(u => u.UsuarioID).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Inversion>(entity =>
        {
            entity.ToTable("Inversiones");
            entity.HasKey(e => e.InversionID);
            entity.Property(e => e.MontoInvertido).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TokensAsignados).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FechaInversion).HasDefaultValueSql("GETDATE()");
            entity.HasOne<Proyecto>().WithMany().HasForeignKey("ProyectoID");
            entity.HasOne<Usuario>().WithMany().HasForeignKey("UsuarioID");
        });

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.ToTable("Milestones");
            entity.HasKey(e => e.MilestoneID);
            entity.Property(e => e.Porcentaje).IsRequired();
            entity.Property(e => e.Monto).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Liberado).HasDefaultValue(false);
            entity.Property(e => e.Estado).HasMaxLength(20).HasDefaultValue("Pendiente");
            entity.HasOne<Proyecto>().WithMany().HasForeignKey("ProyectoID");
        });

        modelBuilder.Entity<Voto>(entity =>
        {
            entity.ToTable("Votos");
            entity.HasKey(e => e.VotoID);
            entity.Property(e => e.PesoVoto).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FechaVoto).HasDefaultValueSql("GETDATE()");
            entity.HasOne<Milestone>().WithMany().HasForeignKey("MilestoneID");
            entity.HasOne<Usuario>().WithMany().HasForeignKey("UsuarioID");
        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.ToTable("Pagos");
            entity.HasKey(e => e.PagoID);
            entity.Property(e => e.MontoPago).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Pagado).HasDefaultValue(false);
            entity.HasOne<Proyecto>().WithMany().HasForeignKey("ProyectoID");
        });

        modelBuilder.Entity<Reembolso>(entity =>
        {
            entity.ToTable("Reembolsos");
            entity.HasKey(e => e.ReembolsoID);
            entity.Property(e => e.MontoReembolso).HasColumnType("decimal(18,2)");
            entity.Property(e => e.FechaReembolso).HasDefaultValueSql("GETDATE()");
            entity.HasOne<Proyecto>().WithMany().HasForeignKey("ProyectoID");
            entity.HasOne<Usuario>().WithMany().HasForeignKey("UsuarioID");
        });

        modelBuilder.Entity<Recompensa>(entity =>
        {
            entity.ToTable("Recompensas");
            entity.HasKey(e => e.RecompensaID);
            entity.Property(e => e.MontoGanancia).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Reclamada).HasDefaultValue(false);
            entity.HasOne<Proyecto>().WithMany().HasForeignKey("ProyectoID");
            entity.HasOne<Usuario>().WithMany().HasForeignKey("UsuarioID");
        });

        modelBuilder.Entity<Evidencia>(entity =>
        {
            entity.ToTable("Evidencias");
            entity.HasKey(e => e.EvidenciaID);
            entity.Property(e => e.ArchivoURL).IsRequired().HasMaxLength(500);
            entity.HasOne<Proyecto>().WithMany().HasForeignKey("ProyectoID");
        });
    }
}
