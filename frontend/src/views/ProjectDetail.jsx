import { useState } from "react";
import { ArrowLeft, Calendar, Globe, Shield, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useProject } from "../hooks/useProject";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import BadgeStatus from "../components/ui/BadgeStatus";
import MilestoneRow from "../components/MilestoneRow";

export default function ProjectDetail() {
  const { user, setActiveView, deleteCreatorProject } = useApp();
  const { project, invest, vote, votes } = useProject();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  if (!project) {
    return (
      <section className="px-8 py-16 md:px-20">
        <p className="text-text-secondary">No hay proyecto seleccionado.</p>
        <Button onClick={() => setActiveView("dashboard")}>Volver</Button>
      </section>
    );
  }

  const isCreator = user?.activeRole === "creator";
  const progress = Math.min((project.raised / project.goal) * 100, 100);
  const projectVotes = votes[project.id] || { for: 12, against: 4 };

  function handleInvest() {
    invest(project.id, amount);
    setAmount("");
  }

  function handleVote(support) {
    vote(project.id, support);
    setMessage(
      support
        ? "Voto registrado a favor del milestone"
        : "Voto registrado en contra del milestone"
    );
  }

  function handleDelete() {
    const confirmDelete = window.confirm("¿Estás seguro que quieres borrar el proyecto?");

    if (confirmDelete) {
      deleteCreatorProject(project.id);
      alert("Proyecto eliminado correctamente");
    }
  }

  return (
    <section className="min-h-[70vh] bg-radial-green px-8 py-16 md:px-20">
      <button
        onClick={() => setActiveView("dashboard")}
        className="mb-8 flex items-center gap-2 text-text-secondary hover:text-white"
      >
        <ArrowLeft size={20} />
        Volver a proyectos
      </button>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card className="overflow-hidden">
            <img src={project.image} alt={project.name} className="h-80 w-full object-cover" />

            <div className="p-8">
              <BadgeStatus status={project.status} />

              <h2 className="mt-5 text-4xl font-black text-white">{project.name}</h2>

              <p className="mt-4 text-lg leading-8 text-text-secondary">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Shield size={16} className="text-primary" />
                  Evidencia IPFS
                </span>

                <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Calendar size={16} className="text-secondary" />
                  {project.daysLeft} días restantes
                </span>

                <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Globe size={16} />
                  Polygon Amoy listo
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-text-muted">Meta</p>
                  <p className="text-2xl font-bold text-white">{project.goal} USDC</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-text-muted">Recaudado</p>
                  <p className="text-2xl font-bold text-primary">{project.raised} USDC</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-text-muted">Interés</p>
                  <p className="text-2xl font-bold text-secondary">{project.interest}%</p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="mb-5 text-2xl font-bold text-white">Milestones</h3>

            <div className="space-y-4">
              {(project.milestones || []).map((milestone) => (
                <MilestoneRow key={milestone.id} milestone={milestone} />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {!isCreator && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">Invertir</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Simulación de inversión en USDC.
              </p>

              <input
                className="input-field mt-5"
                type="number"
                placeholder="Monto en USDC"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Button onClick={handleInvest} className="mt-4 w-full">
                Invertir
              </Button>
            </Card>
          )}

          {!isCreator && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">
                Votación de milestone
              </h3>

              <p className="mt-2 text-sm text-text-secondary">
                Cada proyecto mantiene su propia votación.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-center">
                  <p className="text-sm text-text-secondary">A favor</p>
                  <p className="text-3xl font-bold text-primary">{projectVotes.for}</p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                  <p className="text-sm text-text-secondary">En contra</p>
                  <p className="text-3xl font-bold text-red-400">{projectVotes.against}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Button className="w-full" onClick={() => handleVote(true)}>
                  Aprobar
                </Button>

                <Button variant="danger" className="w-full" onClick={() => handleVote(false)}>
                  Rechazar
                </Button>
              </div>

              {message && (
                <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-text-secondary">
                  {message}
                </p>
              )}
            </Card>
          )}

          {isCreator && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">Gestión del proyecto</h3>

              <p className="mt-2 text-sm text-text-secondary">
                Como negociador puedes eliminar este proyecto si lo necesitas.
              </p>

              <Button variant="danger" className="mt-5 w-full" onClick={handleDelete}>
                <Trash2 size={18} />
                Borrar proyecto
              </Button>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
