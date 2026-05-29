import { motion } from "framer-motion";
import { ArrowUpRight, Coins, LayoutGrid, PlusCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import BadgeStatus from "../components/ui/BadgeStatus";

export default function Dashboard() {
  const { user, visibleProjects, openProject, setActiveView, projectsLoading, loadProjects, startCreateProject } = useApp();

  const isCreator = user?.activeRole === "creator";

  const totalGoal = visibleProjects.reduce((acc, p) => acc + (p.goal || 0), 0);
  const totalRaised = visibleProjects.reduce((acc, p) => acc + (p.raised || 0), 0);

  const stats = isCreator
    ? [
        ["Mis proyectos", visibleProjects.length, PlusCircle],
        ["Capital solicitado", `${totalGoal} USDC`, Coins],
        ["Recaudado", `${totalRaised} USDC`, ShieldCheck],
      ]
    : [
        ["Proyectos disponibles", visibleProjects.length, LayoutGrid],
        ["Capital en proyectos", `${totalGoal} USDC`, Coins],
        ["Total recaudado", `${totalRaised} USDC`, ShieldCheck],
      ];

  return (
    <section className="min-h-[70vh] bg-radial-green px-8 py-16 md:px-20">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white"
          >
            {isCreator ? "Panel del negociador" : "Panel del inversor"}
          </motion.h2>

          <p className="mt-3 text-text-secondary">
            {isCreator
              ? "Administra tus proyectos creados y revisa su estado."
              : "Explora proyectos, invierte y participa en votaciones."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadProjects} disabled={projectsLoading}>
            <RefreshCw size={18} className={projectsLoading ? "animate-spin" : ""} />
            Actualizar
          </Button>
          {isCreator && (
            <Button onClick={startCreateProject}>
              <PlusCircle size={18} />
              Crear nuevo proyecto
            </Button>
          )}
        </div>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-3">
        {stats.map(([label, value, Icon], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon />
              </div>
              <div>
                <p className="text-sm text-text-muted">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          {isCreator ? "Mis proyectos" : "Proyectos disponibles"}
        </h3>
      </div>

      {visibleProjects.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-2xl font-bold text-white">Aún no hay proyectos</h3>
          <p className="mt-3 text-text-secondary">
            Crea tu primer proyecto para que aparezca en este panel.
          </p>
          {isCreator && (
            <Button className="mt-6" onClick={startCreateProject}>
              Crear proyecto
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          {visibleProjects.map((project) => {
            const progress = Math.min((project.raised / project.goal) * 100, 100);

            return (
              <Card key={project.id} className="overflow-hidden">
                <img src={project.image} alt={project.name} className="h-44 w-full object-cover" />

                <div className="p-6">
                  <BadgeStatus status={project.status} />

                  <h3 className="mt-4 text-xl font-bold text-white">{project.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{project.description}</p>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="text-text-muted">Meta: {project.goal} USDC</span>
                    <span className="font-bold text-primary">{Math.round(progress)}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress}%` }}></div>
                  </div>

                  <Button className="mt-5 w-full" onClick={() => openProject(project)}>
                    Ver proyecto <ArrowUpRight size={18} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
