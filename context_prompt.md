# ESTRUCTURA DEL PROYECTO

```
.
./README.md
./RUN-LOCAL.md
./backend
./backend/Controllers
./backend/Controllers/EvidenciasController.cs
./backend/Controllers/HelloController.cs
./backend/Controllers/InversionesController.cs
./backend/Controllers/MilestonesController.cs
./backend/Controllers/PagosController.cs
./backend/Controllers/ProyectosController.cs
./backend/Controllers/RecompensasController.cs
./backend/Controllers/ReembolsosController.cs
./backend/Controllers/UsuariosController.cs
./backend/Controllers/VotosController.cs
./backend/Data
./backend/Data/GreenFixDbContext.cs
./backend/Migrations
./backend/Migrations/20260518024715_InitialCreate.Designer.cs
./backend/Migrations/20260518024715_InitialCreate.cs
./backend/Migrations/GreenFixDbContextModelSnapshot.cs
./backend/Models
./backend/Models/Evidencia.cs
./backend/Models/Inversion.cs
./backend/Models/Milestone.cs
./backend/Models/Pago.cs
./backend/Models/Proyecto.cs
./backend/Models/Recompensa.cs
./backend/Models/Reembolso.cs
./backend/Models/Usuario.cs
./backend/Models/Voto.cs
./backend/Program.cs
./backend/Properties
./backend/Properties/launchSettings.json
./backend/appsettings.Development.json
./backend/appsettings.json
./backend/backend.csproj
./backend/backend.csproj.lscache
./backend/backend.http
./backend/backend.sln
./context_prompt.md
./contexto_proyecto.txt
./contracts
./contracts/README.md
./contracts/contracts
./contracts/contracts/core
./contracts/contracts/greenFix.sol
./contracts/contracts/ignition
./contracts/contracts/interfaces
./contracts/contracts/libraries
./contracts/contracts/mocks
./contracts/deployments.json
./contracts/hardhat.config.cts
./contracts/package-lock.json
./contracts/package.json
./contracts/scripts
./contracts/scripts/deploy.cjs
./contracts/scripts/smoke.cjs
./contracts/test
./contracts/test/FundingTest.t.sol
./contracts/test/MilestoneTest.t.sol
./contracts/test/RefundTest.t.sol
./contracts/test/RepaymentTest.t.sol
./contracts/test/funding.test.js
./contracts/tsconfig.json
./database
./database/00_create_database.sql
./database/01_schema.sql
./database/02_functions.sql
./database/03_stored_procedures.sql
./database/04_triggers.sql
./database/README.md
./frontend
./frontend/README.md
./frontend/eslint.config.js
./frontend/index.html
./frontend/package-lock.json
./frontend/package.json
./frontend/src
./frontend/src/App.css
./frontend/src/App.jsx
./frontend/src/assets
./frontend/src/blockchain
./frontend/src/components
./frontend/src/context
./frontend/src/hooks
./frontend/src/index.css
./frontend/src/main.jsx
./frontend/src/views
./frontend/vite.config.js
./greenFix.sln
```

# DETALLE DE ARCHIVOS CLAVE

## Archivo: frontend/src/views/CreateProject.jsx
```
import { useState } from "react";
import { ArrowLeft, Info, Rocket, ShieldCheck, ShieldAlert } from "lucide-react";
import { useFactory } from "../hooks/useFactory";
import { useApp } from "../context/AppContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

// Opciones de duración del préstamo: de 1 semana a 6 meses.
const DURATION_OPTIONS = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "1 mes", days: 30 },
  { label: "2 meses", days: 60 },
  { label: "3 meses", days: 90 },
  { label: "6 meses", days: 180 },
];

export default function CreateProject() {
  const { createProject } = useFactory();
  const { setActiveView, account, txPending, kycVerified, openKycModal } = useApp();

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [imageUrl, setImageUrl] = useState("");

  function calculateInterest(amount) {
    const value = Number(amount);
    if (value <= 1000) return 6;
    if (value <= 2500) return 8;
    return 10;
  }

  async function handleSubmit() {
    if (!account) {
      alert("Conecta tu wallet primero");
      return;
    }
    if (!kycVerified) {
      openKycModal();
      return;
    }
    if (!name || !goal || !description) {
      alert("Complete nombre, monto y descripción");
      return;
    }
    if (!imageUrl.trim()) {
      alert("Proporcione un link de imagen para el proyecto");
      return;
    }

    await createProject({ name, goal, description, durationDays, imageUrl: imageUrl.trim() });

    setName("");
    setGoal("");
    setDescription("");
    setImageUrl("");
    setDurationDays(30);
  }

  const interest = goal ? calculateInterest(goal) : 0;
  const guarantee = goal ? Number(goal) * 0.05 : 0;

  // Bloqueo total si no pasó el KYC.
  if (!kycVerified) {
    return (
      <section className="min-h-[70vh] bg-radial-green px-8 py-16 md:px-20">
        <button onClick={() => setActiveView("dashboard")} className="mb-8 flex items-center gap-2 text-text-secondary hover:text-white">
          <ArrowLeft size={20} />
          Volver al dashboard
        </button>
        <Card className="mx-auto max-w-xl p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-400">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">Verificación requerida</h2>
          <p className="mt-3 text-text-secondary">
            Para crear proyectos primero debes completar la verificación KYC (simulada).
          </p>
          <Button className="mt-6" onClick={openKycModal}>
            <ShieldCheck size={18} />
            Iniciar verificación KYC
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] bg-radial-green px-8 py-16 md:px-20">
      <button onClick={() => setActiveView("dashboard")} className="mb-8 flex items-center gap-2 text-text-secondary hover:text-white">
        <ArrowLeft size={20} />
        Volver al dashboard
      </button>

      <div className="mb-8">
        <h2 className="text-4xl font-black text-white">Crear nuevo proyecto</h2>
        <p className="mt-3 text-text-secondary">
          Registra un proyecto para buscar financiamiento. El interés se calcula automáticamente.
        </p>
        <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          <ShieldCheck size={16} /> KYC verificado
        </span>
      </div>

      <Card className="max-w-3xl p-8">
        <div className="grid gap-6">
          <div>
            <label className="label-field">Nombre del proyecto</label>
            <input className="input-field" placeholder="Ej: Café sostenible" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="label-field">Monto solicitado en USDC</label>
            <input className="input-field" type="number" placeholder="Ej: 1500" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>

          <div>
            <label className="label-field">Descripción</label>
            <textarea
              className="input-field min-h-32 resize-none"
              placeholder="Describe el objetivo del proyecto y cómo usarás el financiamiento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="label-field">Duración del préstamo</label>
              <select className="input-field" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))}>
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.days} value={opt.days}>{opt.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-muted">Entre 1 semana y 6 meses.</p>
            </div>

            <div>
              <label className="label-field">Link de imagen (URL)</label>
              <input className="input-field" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              <p className="mt-1 text-xs text-text-muted">Se usará como portada del proyecto.</p>
            </div>
          </div>

          {imageUrl.trim() && (
            <img
              src={imageUrl}
              alt="Vista previa"
              className="h-40 w-full rounded-2xl object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm text-text-secondary">Interés calculado</p>
              <p className="text-2xl font-bold text-primary">{interest}%</p>
            </div>
            <div className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4">
              <p className="text-sm text-text-secondary">Garantía 5%</p>
              <p className="text-2xl font-bold text-secondary">{guarantee.toFixed(2)} USDC</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Info className="shrink-0 text-secondary" />
            <p className="text-sm text-text-secondary">
              Al crear el proyecto se despliega su contrato on-chain y se deposita automáticamente la garantía del 5% en USDC. Asegúrate de tener saldo suficiente (usa el Faucet).
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={txPending}>
            <Rocket size={18} />
            {txPending ? "Procesando en blockchain..." : "Crear proyecto"}
          </Button>
        </div>
      </Card>
    </section>
  );
}
```

## Archivo: frontend/src/views/Dashboard.jsx
```
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
```

## Archivo: frontend/src/views/Home.jsx
```
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Users } from "lucide-react";
import { useApp } from "../context/AppContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import BadgeStatus from "../components/ui/BadgeStatus";

export default function Home() {
  const { projects, openLogin, openProject } = useApp();
  const featured = projects.slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden bg-radial-green px-8 py-20 md:px-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"></div>
        </div>

        <div className="relative grid items-center gap-12 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              Plataforma Web3 para micro-crowdfunding
            </p>

            <h1 className="mb-6 text-5xl font-black leading-tight text-white md:text-7xl">
              Financia proyectos. Genera impacto real.
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-8 text-text-secondary">
              GreenFix conecta pequeños negocios con inversionistas mediante
              milestones, votaciones y trazabilidad, ejecutándose sobre una red
              blockchain local de Hardhat.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button onClick={openLogin}>
                Comenzar ahora <ArrowRight size={18} />
              </Button>

              <Button variant="secondary" onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}>
                Cómo funciona
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8">
            <h3 className="mb-6 text-2xl font-bold text-white">
              Resumen del protocolo
            </h3>

            <div className="space-y-4">
              {[
                "Fondos en escrow",
                "Liberación por milestones",
                "Votaciones de inversionistas",
                "Rewards y refunds preparados",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <CheckCircle2 className="text-primary" />
                  <span className="font-semibold text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-8 py-16 md:px-20">
        <h2 className="mb-8 text-4xl font-bold text-white">¿Qué es GreenFix?</h2>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <Users className="text-primary" />
            <h3 className="mt-4 text-xl font-bold text-white">Conecta</h3>
            <p className="mt-2 text-text-secondary">
              Une emprendedores que buscan capital con personas interesadas en apoyar proyectos.
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="text-secondary" />
            <h3 className="mt-4 text-xl font-bold text-white">Protege</h3>
            <p className="mt-2 text-text-secondary">
              Utiliza estados, evidencias y votaciones para dar más confianza al financiamiento.
            </p>
          </Card>

          <Card className="p-6">
            <Sparkles className="text-primary" />
            <h3 className="mt-4 text-xl font-bold text-white">Escala</h3>
            <p className="mt-2 text-text-secondary">
              La arquitectura queda lista para backend, wallet real y smart contracts.
            </p>
          </Card>
        </div>
      </section>

      <section id="como-funciona" className="bg-surface/40 px-8 py-16 md:px-20">
        <h2 className="mb-8 text-center text-4xl font-bold text-white">
          ¿Cómo funciona?
        </h2>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            ["1", "Crear proyecto", "El negociador publica su idea, monto y descripción."],
            ["2", "Financiar", "El inversor aporta USDC real on-chain."],
            ["3", "Votar", "Los milestones se aprueban mediante votación."],
            ["4", "Reclamar", "El sistema queda preparado para rewards y refunds."],
          ].map(([num, title, text]) => (
            <Card key={title} className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {num}
              </div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 md:px-20">
        <h2 className="mb-3 text-4xl font-bold text-white">Proyectos destacados</h2>
        <p className="mb-8 text-text-secondary">
          Muestra inicial para generar confianza. Para invertir se debe iniciar sesión.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {featured.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <img src={project.image} alt={project.name} className="h-44 w-full object-cover" />

              <div className="p-6">
                <BadgeStatus status={project.status} />
                <h3 className="mt-4 text-xl font-bold text-white">{project.name}</h3>
                <p className="mt-2 text-sm text-text-secondary">{project.description}</p>

                <Button variant="outline" className="mt-5 w-full" onClick={() => openProject(project)}>
                  Ver proyecto
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/20 to-secondary/10 px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-white">
          Sé parte del cambio con GreenFix
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
          Un frontend moderno, modular y preparado para una integración Web3 real.
        </p>

        <Button onClick={openLogin} className="mt-8">
          Comenzar ahora
        </Button>
      </section>
    </main>
  );
}
```

## Archivo: frontend/src/views/ProjectDetail.jsx
```
import { useState } from "react";
import { ArrowLeft, Calendar, Globe, Shield, CheckCircle2, Clock, Circle, Lock, FileClock, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import BadgeStatus from "../components/ui/BadgeStatus";

const milestoneIcon = (status) => {
  if (status === "Completed") return CheckCircle2;
  if (status === "Voting") return Clock;
  if (status === "Locked") return Lock;
  return Circle;
};

export default function ProjectDetail() {
  const {
    user,
    account,
    txPending,
    setActiveView,
    selectedProject: project,
    invest,
    vote,
    finalizeFunding,
    requestMilestone,
    finalizeVoting,
    makeRepayment,
    claimRewards,
    claimRefund,
  } = useApp();

  const [amount, setAmount] = useState("");
  const [evidence, setEvidence] = useState("ipfs://evidencia-demo");

  if (!project) {
    return (
      <section className="px-8 py-16 md:px-20">
        <p className="text-text-secondary">No hay proyecto seleccionado.</p>
        <Button onClick={() => setActiveView("dashboard")} className="mt-4">Volver</Button>
      </section>
    );
  }

  const isCreator = user?.activeRole === "creator";
  const progress = Math.min((project.raised / project.goal) * 100, 100);
  const remaining = Math.max(project.goal - project.raised, 0);
  const fundingReached = project.raised >= project.goal;

  const handleInvest = async () => {
    const ok = await invest(project.contractAddress, amount);
    if (ok) setAmount("");
  };

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
              <p className="mt-4 text-lg leading-8 text-text-secondary">{project.description}</p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-text-secondary">
                <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Shield size={16} className="text-primary" />
                  Evidencia IPFS
                </span>
                <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Calendar size={16} className="text-secondary" />
                  Milestone actual: {project.currentMilestone + 1}/{project.milestones.length || 4}
                </span>
                <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Globe size={16} />
                  Red local Hardhat
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
              <p className="mt-2 font-mono text-xs text-text-muted break-all">{project.contractAddress}</p>
            </div>
          </Card>

          {/* MILESTONES */}
          <Card className="p-8">
            <h3 className="mb-5 text-2xl font-bold text-white">Milestones</h3>
            <div className="space-y-4">
              {project.milestones.length === 0 && (
                <p className="text-text-secondary">Los milestones se generan al finalizar el funding.</p>
              )}

              {project.milestones.map((m) => {
                const Icon = milestoneIcon(m.status);
                return (
                  <div key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon size={22} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{m.title}</h4>
                          <p className="mt-1 text-sm text-text-secondary">{m.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BadgeStatus status={m.status} />
                        <span className="font-mono font-bold text-primary">{m.percentage}%</span>
                      </div>
                    </div>

                    {/* Votación activa */}
                    {m.votingActive && (() => {
                      const supply = project.tokenTotalSupply || 0;
                      const participacion = supply > 0 ? ((m.votesFor + m.votesAgainst) / supply) * 100 : 0;
                      const aprobacion = (m.votesFor + m.votesAgainst) > 0
                        ? (m.votesFor / (m.votesFor + m.votesAgainst)) * 100 : 0;
                      const QUORUM = 51; // mínimo de participación on-chain
                      return (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <div className="mb-2 flex gap-4 text-sm">
                          <span className="text-primary">A favor: {m.votesFor} USDC</span>
                          <span className="text-red-400">En contra: {m.votesAgainst} USDC</span>
                        </div>

                        {/* Barra de quórum (peso proporcional al USDC invertido) */}
                        <div className="mb-1 flex justify-between text-xs text-text-muted">
                          <span>Participación: {participacion.toFixed(1)}%</span>
                          <span>Quórum requerido: {QUORUM}%</span>
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(participacion, 100)}%` }}></div>
                          <div className="absolute top-0 h-full w-px bg-yellow-400" style={{ left: `${QUORUM}%` }}></div>
                        </div>
                        <p className="mt-2 text-xs text-text-muted">
                          Aprobación actual: {aprobacion.toFixed(1)}% · El peso del voto es proporcional al USDC invertido (1 USDC = 1 voto).
                        </p>

                        <div className="mt-3"></div>
                        {!isCreator && (
                          <div className="flex gap-3">
                            <Button className="w-full" disabled={txPending} onClick={() => vote(project.contractAddress, m.id, true)}>Aprobar</Button>
                            <Button variant="danger" className="w-full" disabled={txPending} onClick={() => vote(project.contractAddress, m.id, false)}>Rechazar</Button>
                          </div>
                        )}
                        {isCreator && (
                          <Button variant="secondary" className="w-full" disabled={txPending} onClick={() => finalizeVoting(project.contractAddress, m.id)}>
                            Finalizar votación
                          </Button>
                        )}
                      </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Solicitar liberación del milestone actual (creador, estado Active) */}
            {isCreator && project.status === "Active" && project.currentMilestone < project.milestones.length && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <label className="label-field">Evidencia (IPFS URI)</label>
                <input className="input-field" value={evidence} onChange={(e) => setEvidence(e.target.value)} />
                <Button className="mt-3 w-full" disabled={txPending} onClick={() => requestMilestone(project.contractAddress, evidence)}>
                  Solicitar liberación del Hito {project.currentMilestone + 1}
                </Button>
              </div>
            )}
          </Card>

          {/* ACTUALIZACIONES / COMPROBANTES (Muy pronto) */}
          <Card className="relative overflow-hidden p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <FileClock size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Actualizaciones / Comprobantes de cumplimiento</h3>
                <p className="text-sm text-text-secondary">Bitácora de avances y evidencias verificables del proyecto.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] py-12 text-center">
              <Sparkles className="text-primary" />
              <p className="text-lg font-bold text-white">En próximas actualizaciones…</p>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-bold uppercase tracking-wide text-primary">
                Muy pronto
              </span>
              <p className="max-w-md text-sm text-text-muted">
                Aquí el negociador podrá publicar avances, fotos y comprobantes de cumplimiento de cada hito.
              </p>
            </div>
          </Card>

          {/* REPAYMENTS (creador) */}
          {isCreator && project.repayments.length > 0 && (
            <Card className="p-8">
              <h3 className="mb-5 text-2xl font-bold text-white">Cuotas de pago</h3>
              <div className="space-y-3">
                {project.repayments.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-text-secondary">Cuota #{r.id + 1} — {r.amount.toFixed(2)} USDC</span>
                    {r.paid ? (
                      <span className="font-bold text-primary">Pagada ✓</span>
                    ) : (
                      <Button disabled={txPending || project.status !== "Active"} onClick={() => makeRepayment(project.contractAddress, r.id)}>
                        Pagar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* PANEL LATERAL DE ACCIONES */}
        <div className="space-y-8">
          {/* Invertir */}
          {!isCreator && project.status === "Funding" && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">Invertir</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Faltan <span className="font-bold text-primary">{remaining} USDC</span> para alcanzar la meta. Inversión mínima: 10 USDC.
              </p>
              <input
                className="input-field mt-5"
                type="number"
                placeholder="Monto en USDC"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleInvest} className="mt-4 w-full" disabled={txPending}>
                {txPending ? "Procesando..." : "Invertir"}
              </Button>
            </Card>
          )}

          {/* Reclamar recompensas */}
          {!isCreator && project.status === "Completed" && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">Reclamar recompensas</h3>
              <p className="mt-2 text-sm text-text-secondary">El proyecto terminó. Reclama tu capital + intereses.</p>
              <Button className="mt-4 w-full" disabled={txPending} onClick={() => claimRewards(project.contractAddress)}>
                Reclamar
              </Button>
            </Card>
          )}

          {/* Reclamar reembolso */}
          {!isCreator && project.status === "Refunding" && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">Reclamar reembolso</h3>
              <p className="mt-2 text-sm text-text-secondary">El proyecto entró en reembolso. Recupera tu parte proporcional.</p>
              <Button className="mt-4 w-full" disabled={txPending} onClick={() => claimRefund(project.contractAddress)}>
                Reclamar reembolso
              </Button>
            </Card>
          )}

          {/* Finalizar funding (creador) */}
          {isCreator && project.status === "Funding" && (
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-white">Gestión del funding</h3>
              <p className="mt-2 text-sm text-text-secondary">
                {fundingReached
                  ? "Meta alcanzada. Activa el proyecto para generar milestones y cuotas."
                  : `Aún faltan ${remaining} USDC. El funding solo se finaliza al alcanzar la meta exacta.`}
              </p>
              <Button className="mt-4 w-full" disabled={txPending || !fundingReached} onClick={() => finalizeFunding(project.contractAddress)}>
                Finalizar funding
              </Button>
            </Card>
          )}

          {/* Estado del proyecto */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">Estado on-chain</h3>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between"><span>Estado</span><BadgeStatus status={project.status} /></div>
              <div className="flex justify-between"><span>Garantía depositada</span><span>{project.guaranteeDeposited ? "Sí" : "No"}</span></div>
              <div className="flex justify-between"><span>Hito actual</span><span>{project.currentMilestone + 1} / {project.milestones.length || 4}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
```

## Archivo: frontend/src/context/AppContext.jsx
```
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  connectMetaMask,
  getUsdcBalance,
  mintUsdc,
  getAllProjects,
  createProject as createProjectOnChain,
  invest as investOnChain,
  vote as voteOnChain,
  finalizeFunding as finalizeFundingOnChain,
  requestMilestoneRelease as requestMilestoneReleaseOnChain,
  finalizeVoting as finalizeVotingOnChain,
  makeRepayment as makeRepaymentOnChain,
  claimRewards as claimRewardsOnChain,
  claimRefund as claimRefundOnChain,
} from "../blockchain/web3Service";

const AppContext = createContext();

const BACKEND_URL = "http://localhost:5029";

// Imágenes de relleno para que las tarjetas se vean bien (la metadata real
// vive en el backend / IPFS; esto es solo presentación).
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=900",
];

// Usuarios demo (no hay backend de auth en el MVP: el login solo elige el rol).
const users = [
  { id: 1, name: "Maycol", email: "inversor@gmail.com", password: "12345", roles: ["investor"] },
  { id: 2, name: "Negociador GreenFix", email: "negociador@gmail.com", password: "12345", roles: ["creator"] },
];

function getSaved(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function calculateInterestBps(goal) {
  const amount = Number(goal);
  if (amount <= 1000) return 600; // 6%
  if (amount <= 2500) return 800; // 8%
  return 1000; // 10%
}

function milestoneStatus(milestone, index, currentMilestone) {
  if (milestone.released || index < currentMilestone) return "Completed";
  if (milestone.votingActive) return "Voting";
  if (index === currentMilestone) return "Pending";
  return "Locked";
}

/**
 * Convierte el resumen on-chain en el modelo que consumen las vistas,
 * enriquecido con la metadata del backend cuando está disponible.
 */
function buildProjectModel(chainProject, metadataByAddress, index) {
  const meta = metadataByAddress[chainProject.contractAddress.toLowerCase()] || {};
  const nameFromUri = (chainProject.metadataURI || "").replace("ipfs://", "");
  // Imagen personalizada del negociador; solo se usa un fallback si no hay ninguna.
  const customImage = meta.imagenURL || meta.imagenUrl;

  return {
    id: chainProject.contractAddress,
    projectId: chainProject.projectId,
    contractAddress: chainProject.contractAddress,
    creator: chainProject.creator,
    name: meta.nombre || nameFromUri || `Proyecto #${chainProject.projectId}`,
    description: meta.descripcion || "Proyecto de financiamiento descentralizado en GreenFix.",
    image: customImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    goal: chainProject.goal,
    raised: chainProject.raised,
    interest: chainProject.interest,
    status: chainProject.status,
    state: chainProject.state,
    guaranteeDeposited: chainProject.guaranteeDeposited,
    currentMilestone: chainProject.currentMilestone,
    tokenTotalSupply: chainProject.tokenTotalSupply,
    repayments: chainProject.repayments,
    milestones: chainProject.milestones.map((m, i) => ({
      id: m.id,
      title: `Hito ${i + 1}`,
      description: `Liberación del ${m.percentage}% del capital (${m.amount} USDC).`,
      percentage: m.percentage,
      status: milestoneStatus(m, i, chainProject.currentMilestone),
      released: m.released,
      votingActive: m.votingActive,
      votesFor: m.votesFor,
      votesAgainst: m.votesAgainst,
      evidenceURI: m.evidenceURI,
    })),
  };
}

export function AppProvider({ children }) {
  const [account, setAccount] = useState(() => getSaved("greenfix-account", ""));
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);

  const [user, setUser] = useState(() => getSaved("greenfix-user", null));
  const [authError, setAuthError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const [activeView, setActiveView] = useState(() => getSaved("greenfix-active-view", "home"));
  const [selectedId, setSelectedId] = useState(() => getSaved("greenfix-selected-id", null));

  // KYC (simulado, local). Mapa { [usuarioId]: true }.
  const [kycMap, setKycMap] = useState(() => getSaved("greenfix-kyc", {}));
  const [kycModalOpen, setKycModalOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // ─────────────── Persistencia ligera de sesión / navegación ───────────────
  useEffect(() => { localStorage.setItem("greenfix-user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("greenfix-account", JSON.stringify(account)); }, [account]);
  useEffect(() => { localStorage.setItem("greenfix-active-view", JSON.stringify(activeView)); }, [activeView]);
  useEffect(() => { localStorage.setItem("greenfix-selected-id", JSON.stringify(selectedId)); }, [selectedId]);
  useEffect(() => { localStorage.setItem("greenfix-kyc", JSON.stringify(kycMap)); }, [kycMap]);

  // ─────────────── Carga de proyectos desde la cadena ───────────────
  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const chainProjects = await getAllProjects();

      // Metadata del backend (opcional, tolerante a que esté caído).
      let metadataByAddress = {};
      try {
        const res = await fetch(`${BACKEND_URL}/api/proyectos`);
        if (res.ok) {
          const data = await res.json();
          metadataByAddress = data.reduce((acc, p) => {
            if (p.contractAddress) acc[p.contractAddress.toLowerCase()] = p;
            return acc;
          }, {});
        }
      } catch {
        /* backend no disponible: seguimos solo con datos on-chain */
      }

      setProjects(chainProjects.map((p, i) => buildProjectModel(p, metadataByAddress, i)));
    } catch (error) {
      console.error("Error cargando proyectos on-chain:", error);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Refrescar saldo USDC cuando cambia la cuenta.
  const refreshBalance = useCallback(async (address) => {
    try {
      setUsdcBalance(await getUsdcBalance(address));
    } catch {
      setUsdcBalance(0);
    }
  }, []);

  useEffect(() => {
    if (account) refreshBalance(account);
  }, [account, refreshBalance]);

  // Reaccionar a cambios de cuenta en MetaMask.
  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts) => setAccount(accounts[0] || "");
    window.ethereum.on?.("accountsChanged", handler);
    return () => window.ethereum.removeListener?.("accountsChanged", handler);
  }, []);

  // ─────────────── Auth (demo local) ───────────────
  function openLogin() { setAuthError(""); setLoginOpen(true); }
  function closeLogin() { setLoginOpen(false); }

  function login(email, password, selectedRole) {
    setAuthError("");
    const found = users.find(
      (u) => u.email === email && u.password === password && u.roles.includes(selectedRole)
    );
    if (!found) {
      setAuthError("Correo, contraseña o rol incorrecto");
      return false;
    }
    setUser({ id: found.id, name: found.name, email: found.email, roles: found.roles, activeRole: selectedRole });
    setActiveView("dashboard");
    setLoginOpen(false);
    return true;
  }

  function logout() {
    setUser(null);
    setActiveView("home");
    setSelectedId(null);
  }

  // ─────────────── KYC (simulado / local) ───────────────
  const kycVerified = user ? Boolean(kycMap[user.id]) : false;

  function openKycModal() { setKycModalOpen(true); }
  function closeKycModal() { setKycModalOpen(false); }

  function approveKyc() {
    if (user) setKycMap((prev) => ({ ...prev, [user.id]: true }));
    setKycModalOpen(false);
  }

  // Lanza la creación solo si el negociador pasó el KYC; si no, abre el modal.
  function startCreateProject() {
    if (!kycVerified) {
      setKycModalOpen(true);
      return;
    }
    setActiveView("create");
  }

  // ─────────────── Wallet ───────────────
  async function connectWallet() {
    setWalletLoading(true);
    try {
      const wallet = await connectMetaMask();
      setAccount(wallet);
    } catch (error) {
      alert("❌ No se pudo conectar la wallet: " + error.message);
    } finally {
      setWalletLoading(false);
    }
  }

  function disconnectWallet() {
    setAccount("");
    setUsdcBalance(0);
  }

  async function requestFaucet(amount = 5000) {
    if (!account) return alert("Conecta tu wallet primero");
    setTxPending(true);
    try {
      await mintUsdc(amount);
      await refreshBalance(account);
      alert(`✅ Recibiste ${amount} USDC de prueba`);
    } catch (error) {
      alert("❌ Faucet falló: " + (error.shortMessage || error.message));
    } finally {
      setTxPending(false);
    }
  }

  // ─────────────── Acciones on-chain ───────────────
  async function runTx(fn, successMsg) {
    if (!account) {
      alert("Conecta tu wallet primero");
      return false;
    }
    setTxPending(true);
    try {
      await fn();
      await loadProjects();
      if (account) await refreshBalance(account);
      if (successMsg) alert(successMsg);
      return true;
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.shortMessage || error.reason || error.message));
      return false;
    } finally {
      setTxPending(false);
    }
  }

  async function createProject({ name, goal, description, durationDays, imageUrl }) {
    if (!account) {
      alert("Conecta tu wallet primero");
      return;
    }
    if (!kycVerified) {
      setKycModalOpen(true);
      return;
    }
    setTxPending(true);
    try {
      const interestBps = calculateInterestBps(goal);
      // Duración elegida por el negociador (entre 1 semana y 6 meses).
      const days = Math.min(Math.max(Number(durationDays) || 30, 7), 180);
      // Cuotas: semanales para plazos cortos, mensuales para plazos largos.
      const repaymentInterval = days <= 30 ? 7 * 24 * 3600 : 30 * 24 * 3600;

      const result = await createProjectOnChain(
        goal,
        interestBps,
        days,
        repaymentInterval,
        `ipfs://${name}`
      );

      // Guardar metadata en el backend (tolerante a fallos).
      try {
        await fetch(`${BACKEND_URL}/api/proyectos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: name,
            descripcion: description,
            montoObjetivo: Number(goal),
            montoActual: 0,
            interes: interestBps / 100,
            duracionMeses: Math.max(1, Math.round(days / 30)),
            garantia: Number(goal) * 0.05,
            imagenURL: imageUrl || null,
            contractAddress: result.projectAddress,
            estado: "Funding",
            emprendedorId: user?.id ?? 1,
          }),
        });
      } catch {
        /* backend opcional */
      }

      await loadProjects();
      await refreshBalance(account);
      setActiveView("dashboard");
      alert("✅ Proyecto creado on-chain y garantía depositada");
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.shortMessage || error.reason || error.message));
    } finally {
      setTxPending(false);
    }
  }

  const invest = (contractAddress, amount) => {
    const value = Number(amount);
    if (!value || value <= 0) return alert("Ingrese un monto válido");
    return runTx(() => investOnChain(contractAddress, value), "✅ Inversión realizada");
  };

  const vote = (contractAddress, milestoneId, support) =>
    runTx(() => voteOnChain(contractAddress, milestoneId, support),
      support ? "✅ Voto a favor registrado" : "✅ Voto en contra registrado");

  const finalizeFunding = (contractAddress) =>
    runTx(() => finalizeFundingOnChain(contractAddress), "✅ Funding finalizado, proyecto activo");

  const requestMilestone = (contractAddress, evidenceURI) =>
    runTx(() => requestMilestoneReleaseOnChain(contractAddress, evidenceURI), "✅ Votación de milestone iniciada");

  const finalizeVoting = (contractAddress, milestoneId) =>
    runTx(() => finalizeVotingOnChain(contractAddress, milestoneId), "✅ Votación finalizada");

  const makeRepayment = (contractAddress, index) =>
    runTx(() => makeRepaymentOnChain(contractAddress, index), "✅ Cuota pagada");

  const claimRewards = (contractAddress) =>
    runTx(() => claimRewardsOnChain(contractAddress), "✅ Recompensas reclamadas");

  const claimRefund = (contractAddress) =>
    runTx(() => claimRefundOnChain(contractAddress), "✅ Reembolso reclamado");

  // ─────────────── Navegación de proyectos ───────────────
  function openProject(project) {
    setSelectedId(project.contractAddress);
    setActiveView("detail");
  }

  // El proyecto seleccionado se deriva de la lista (siempre fresco).
  const selectedProject = projects.find((p) => p.contractAddress === selectedId) || null;

  // Filtrado por rol.
  const isCreator = user?.activeRole === "creator";
  const visibleProjects = isCreator
    ? projects.filter((p) => account && p.creator?.toLowerCase() === account.toLowerCase())
    : projects;

  return (
    <AppContext.Provider
      value={{
        account,
        usdcBalance,
        walletLoading,
        txPending,
        user,
        authError,
        loginOpen,
        activeView,
        projects,
        projectsLoading,
        visibleProjects,
        selectedProject,
        kycVerified,
        kycModalOpen,
        setActiveView,
        openLogin,
        closeLogin,
        login,
        logout,
        openKycModal,
        closeKycModal,
        approveKyc,
        startCreateProject,
        connectWallet,
        disconnectWallet,
        requestFaucet,
        loadProjects,
        createProject,
        invest,
        vote,
        finalizeFunding,
        requestMilestone,
        finalizeVoting,
        makeRepayment,
        claimRewards,
        claimRefund,
        openProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
```

## Archivo: frontend/src/blockchain/contractsConfig.js
```
// ⚠️ Archivo generado automáticamente por contracts/scripts/deploy.cjs
// No editar a mano: se sobreescribe en cada despliegue local.
export const CONTRACTS = {
  FACTORY_ADDRESS: "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",
  USDC_ADDRESS: "0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43",
};

export const NETWORK_INFO = {
  chainId: "0x7a69",
  chainName: "Hardhat Local",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["http://127.0.0.1:8545"],
  blockExplorerUrls: [],
};
```

## Archivo: frontend/src/blockchain/web3Service.js
```
import { ethers } from "ethers";
import { NETWORK_INFO, CONTRACTS } from "./contractsConfig";
import GreenFixFactoryABI from "./abis/GreenFixFactory.json";
import GreenFixProjectABI from "./abis/GreenFixProject.json";
import MockUSDCABI from "./abis/MockUSDC.json";

// USDC y el token del proyecto usan 6 decimales en el MVP.
export const USDC_DECIMALS = 6;

// El orden DEBE coincidir con libraries/ProjectState.sol
export const STATE_LABELS = [
  "Funding",
  "Active",
  "Voting",
  "Refunding",
  "Completed",
  "Cancelled",
  "Defaulted",
];

const FACTORY_ABI = GreenFixFactoryABI.abi;
const PROJECT_ABI = GreenFixProjectABI.abi;
const USDC_ABI = MockUSDCABI.abi;

// ─────────────────────────── Helpers de unidades ───────────────────────────
export const toUSDC = (value) => ethers.parseUnits(String(value), USDC_DECIMALS);
export const fromUSDC = (value) => Number(ethers.formatUnits(value, USDC_DECIMALS));

// ─────────────────────────── Providers / Signer ───────────────────────────
function hasWallet() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Provider de SOLO LECTURA: pega directo al nodo local por RPC.
 * No requiere MetaMask, así el dashboard puede cargar proyectos sin wallet.
 */
export function getReadProvider() {
  return new ethers.JsonRpcProvider(NETWORK_INFO.rpcUrls[0]);
}

export async function getProvider() {
  if (!hasWallet()) throw new Error("MetaMask no está instalado");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

/**
 * Asegura que MetaMask esté en la red local de Hardhat; si no existe, la agrega.
 */
export async function ensureNetwork() {
  if (!hasWallet()) throw new Error("MetaMask no está instalado");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: NETWORK_INFO.chainId }],
    });
  } catch (switchError) {
    // 4902 = la cadena no está agregada en MetaMask → la añadimos.
    if (switchError.code === 4902 || switchError.code === -32603) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: NETWORK_INFO.chainId,
            chainName: NETWORK_INFO.chainName,
            nativeCurrency: NETWORK_INFO.nativeCurrency,
            rpcUrls: NETWORK_INFO.rpcUrls,
            blockExplorerUrls: NETWORK_INFO.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export async function connectMetaMask() {
  if (!hasWallet()) throw new Error("MetaMask no está instalado");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureNetwork();
  return accounts[0];
}

// ─────────────────────────── Fábricas de contratos ───────────────────────────
async function factoryWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, FACTORY_ABI, signer);
}
function factoryReadOnly() {
  return new ethers.Contract(CONTRACTS.FACTORY_ADDRESS, FACTORY_ABI, getReadProvider());
}
async function usdcWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACTS.USDC_ADDRESS, USDC_ABI, signer);
}
function usdcReadOnly() {
  return new ethers.Contract(CONTRACTS.USDC_ADDRESS, USDC_ABI, getReadProvider());
}
async function projectWithSigner(address) {
  const signer = await getSigner();
  return new ethers.Contract(address, PROJECT_ABI, signer);
}
function projectReadOnly(address) {
  return new ethers.Contract(address, PROJECT_ABI, getReadProvider());
}

// ─────────────────────────── USDC (faucet / balances) ───────────────────────────
export async function getUsdcBalance(address) {
  if (!address) return 0;
  const usdc = usdcReadOnly();
  return fromUSDC(await usdc.balanceOf(address));
}

/** Faucet de demo: acuña USDC de prueba a la cuenta conectada. */
export async function mintUsdc(amount) {
  const usdc = await usdcWithSigner();
  const signer = await getSigner();
  const to = await signer.getAddress();
  const tx = await usdc.mint(to, toUSDC(amount));
  await tx.wait();
  return tx.hash;
}

async function ensureAllowance(usdc, owner, spender, needed) {
  const current = await usdc.allowance(owner, spender);
  if (current < needed) {
    const tx = await usdc.approve(spender, needed);
    await tx.wait();
  }
}

// ─────────────────────────── Crear proyecto ───────────────────────────
/**
 * Crea el proyecto on-chain y deposita la garantía del 5%.
 * @returns {{ txHash: string, projectAddress: string }}
 */
export async function createProject(fundingGoal, interestBps, durationDays, repaymentInterval, metadataURI) {
  const factory = await factoryWithSigner();
  const usdc = await usdcWithSigner();
  const signer = await getSigner();
  const owner = await signer.getAddress();

  const goal = toUSDC(fundingGoal);
  const guarantee = (goal * 5n) / 100n;

  // 1. Crear proyecto
  const txCreate = await factory.createProject(
    goal,
    interestBps,
    durationDays,
    repaymentInterval,
    metadataURI
  );
  const receipt = await txCreate.wait();

  // 2. Extraer la dirección del proyecto del evento ProjectCreated
  let projectAddress = null;
  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);
      if (parsed && parsed.name === "ProjectCreated") {
        projectAddress = parsed.args[2];
        break;
      }
    } catch {
      /* log de otro contrato, ignorar */
    }
  }
  if (!projectAddress) throw new Error("No se pudo obtener la dirección del proyecto");

  // 3. Depositar garantía (approve al proyecto + depositGuarantee)
  const project = new ethers.Contract(projectAddress, PROJECT_ABI, signer);
  await ensureAllowance(usdc, owner, projectAddress, guarantee);
  const txGuarantee = await project.depositGuarantee();
  await txGuarantee.wait();

  return { txHash: receipt.hash, projectAddress };
}

// ─────────────────────────── Acciones de inversor ───────────────────────────
export async function invest(projectAddress, amount) {
  const signer = await getSigner();
  const owner = await signer.getAddress();
  const project = await projectWithSigner(projectAddress);
  const usdc = await usdcWithSigner();

  const parsed = toUSDC(amount);
  await ensureAllowance(usdc, owner, projectAddress, parsed);
  const tx = await project.invest(parsed);
  await tx.wait();
  return tx.hash;
}

export async function vote(projectAddress, milestoneId, support) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.vote(milestoneId, support);
  await tx.wait();
  return tx.hash;
}

export async function claimRewards(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.claimRewards();
  await tx.wait();
  return tx.hash;
}

export async function claimRefund(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.claimRefund();
  await tx.wait();
  return tx.hash;
}

// ─────────────────────────── Acciones de creador ───────────────────────────
export async function finalizeFunding(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.finalizeFunding();
  await tx.wait();
  return tx.hash;
}

export async function requestMilestoneRelease(projectAddress, evidenceURI) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.requestMilestoneRelease(evidenceURI);
  await tx.wait();
  return tx.hash;
}

export async function finalizeVoting(projectAddress, milestoneId) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.finalizeVoting(milestoneId);
  await tx.wait();
  return tx.hash;
}

export async function makeRepayment(projectAddress, repaymentIndex) {
  const signer = await getSigner();
  const owner = await signer.getAddress();
  const project = await projectWithSigner(projectAddress);
  const usdc = await usdcWithSigner();

  const repayment = await project.repayments(repaymentIndex);
  await ensureAllowance(usdc, owner, projectAddress, repayment.amount);
  const tx = await project.makeRepayment(repaymentIndex);
  await tx.wait();
  return tx.hash;
}

export async function cancelFunding(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.cancelFunding();
  await tx.wait();
  return tx.hash;
}

export async function activateRefunds(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.activateRefunds();
  await tx.wait();
  return tx.hash;
}

export async function triggerDefaultVote(projectAddress) {
  const project = await projectWithSigner(projectAddress);
  const tx = await project.triggerDefaultVote();
  await tx.wait();
  return tx.hash;
}

// ─────────────────────────── Lecturas on-chain ───────────────────────────
/**
 * Lee el estado completo de un proyecto desde la cadena.
 */
export async function getProjectSummary(projectAddress) {
  const project = projectReadOnly(projectAddress);

  const [stateRaw, totalRaised, currentMilestone, creator, guaranteeDeposited, config, tokenAddress] =
    await Promise.all([
      project.state(),
      project.totalRaised(),
      project.currentMilestone(),
      project.creator(),
      project.guaranteeDeposited(),
      project.config(),
      project.projectToken(),
    ]);

  // Supply total del token del proyecto = total de USDC invertido (mint 1:1).
  // Se usa para calcular el quórum y el peso proporcional de cada voto (ballenas).
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ["function totalSupply() view returns (uint256)"],
    getReadProvider()
  );
  const tokenTotalSupply = fromUSDC(await tokenContract.totalSupply());

  const milestoneCount = Number(await project.getMilestoneCount());
  const milestones = [];
  for (let i = 0; i < milestoneCount; i++) {
    const m = await project.milestones(i);
    milestones.push({
      id: i,
      percentage: Number(m.percentage),
      amount: fromUSDC(m.amount),
      released: m.released,
      votingActive: m.votingActive,
      voteStart: Number(m.voteStart),
      voteEnd: Number(m.voteEnd),
      votesFor: fromUSDC(m.votesFor),
      votesAgainst: fromUSDC(m.votesAgainst),
      evidenceURI: m.evidenceURI,
    });
  }

  const repaymentCount = Number(await project.getRepaymentCount());
  const repayments = [];
  for (let i = 0; i < repaymentCount; i++) {
    const r = await project.repayments(i);
    repayments.push({
      id: i,
      dueDate: Number(r.dueDate),
      amount: fromUSDC(r.amount),
      paid: r.paid,
    });
  }

  const stateIndex = Number(stateRaw);
  const fundingGoal = fromUSDC(config.fundingGoal);

  return {
    contractAddress: projectAddress,
    state: stateIndex,
    status: STATE_LABELS[stateIndex] || "Desconocido",
    creator,
    guaranteeDeposited,
    goal: fundingGoal,
    raised: fromUSDC(totalRaised),
    interest: Number(config.interestBps) / 100,
    currentMilestone: Number(currentMilestone),
    tokenTotalSupply,
    milestones,
    repayments,
  };
}

/**
 * Devuelve los datos del usuario respecto a un proyecto (tokens, claims).
 */
export async function getInvestorPosition(projectAddress, account) {
  if (!account) return { tokens: 0, isInvestor: false, hasClaimedRefund: false };
  const project = projectReadOnly(projectAddress);
  const token = await project.projectToken();
  const tokenContract = new ethers.Contract(
    token,
    ["function balanceOf(address) view returns (uint256)"],
    getReadProvider()
  );
  const [balance, isInvestor, hasClaimedRefund] = await Promise.all([
    tokenContract.balanceOf(account),
    project.isInvestor(account),
    project.hasClaimedRefund(account),
  ]);
  return {
    tokens: fromUSDC(balance),
    isInvestor,
    hasClaimedRefund,
  };
}

/**
 * Lista todos los proyectos creados en el Factory con su estado on-chain.
 */
export async function getAllProjects() {
  const factory = factoryReadOnly();
  const count = Number(await factory.projectCount());

  const projects = [];
  for (let id = 1; id <= count; id++) {
    try {
      const info = await factory.getProject(id);
      const [projectAddress, creator, fundingGoal, createdAt, metadataURI] = info;
      const summary = await getProjectSummary(projectAddress);
      projects.push({
        projectId: id,
        contractAddress: projectAddress,
        creator,
        createdAt: Number(createdAt),
        metadataURI,
        ...summary,
      });
    } catch (e) {
      console.warn(`No se pudo leer el proyecto ${id}:`, e.message);
    }
  }
  return projects;
}
```

## Archivo: backend/Controllers/ProyectosController.cs
```
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProyectosController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public ProyectosController(GreenFixDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtiene la lista de todos los proyectos de la base de datos
    /// </summary>
    /// <returns>Lista de proyectos con su ContractAddress</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectos()
    {
        try
        {
            var proyectos = await _context.Proyectos
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return Ok(proyectos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener proyectos", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene un proyecto específico por su ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Proyecto>> GetProyecto(int id)
    {
        try
        {
            var proyecto = await _context.Proyectos.FindAsync(id);

            if (proyecto == null)
            {
                return NotFound(new { mensaje = $"Proyecto con ID {id} no encontrado" });
            }

            return Ok(proyecto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener el proyecto", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene proyectos por estado (Activo, Completado, Cancelado, etc.)
    /// </summary>
    [HttpGet("estado/{estado}")]
    public async Task<ActionResult<IEnumerable<Proyecto>>> GetProyectosPorEstado(string estado)
    {
        try
        {
            var proyectos = await _context.Proyectos
                .Where(p => p.Estado == estado)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return Ok(proyectos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al filtrar proyectos", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene un proyecto por su ContractAddress
    /// </summary>
    [HttpGet("contract/{contractAddress}")]
    public async Task<ActionResult<Proyecto>> GetProyectoPorContract(string contractAddress)
    {
        try
        {
            var proyecto = await _context.Proyectos
                .FirstOrDefaultAsync(p => p.ContractAddress == contractAddress);

            if (proyecto == null)
            {
                return NotFound(new { mensaje = $"Proyecto con contrato {contractAddress} no encontrado" });
            }

            return Ok(proyecto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al obtener el proyecto", detalle = ex.Message });
        }
    }
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Proyecto proyecto)
    {
        proyecto.FechaCreacion = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(proyecto.Estado))
            proyecto.Estado = "Funding";
        _context.Proyectos.Add(proyecto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProyecto), new { id = proyecto.Id }, proyecto);
    }

    /// <summary>
    /// Actualiza el estado on-chain del proyecto (estado y monto recaudado).
    /// Se usa para sincronizar la metadata del backend con la blockchain.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Proyecto datos)
    {
        var proyecto = await _context.Proyectos.FindAsync(id);
        if (proyecto == null)
            return NotFound(new { mensaje = $"Proyecto con ID {id} no encontrado" });

        if (!string.IsNullOrWhiteSpace(datos.Estado)) proyecto.Estado = datos.Estado;
        if (datos.MontoActual > 0) proyecto.MontoActual = datos.MontoActual;
        if (datos.Estado == "Completed") proyecto.FechaFinalizacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(proyecto);
    }

    /// <summary>
    /// Sincroniza el estado leído de la blockchain por dirección de contrato.
    /// </summary>
    [HttpPut("contract/{contractAddress}/estado")]
    public async Task<IActionResult> UpdateEstadoPorContract(string contractAddress, [FromBody] Proyecto datos)
    {
        var proyecto = await _context.Proyectos
            .FirstOrDefaultAsync(p => p.ContractAddress == contractAddress);
        if (proyecto == null)
            return NotFound(new { mensaje = $"Proyecto con contrato {contractAddress} no encontrado" });

        if (!string.IsNullOrWhiteSpace(datos.Estado)) proyecto.Estado = datos.Estado;
        if (datos.MontoActual > 0) proyecto.MontoActual = datos.MontoActual;

        await _context.SaveChangesAsync();
        return Ok(proyecto);
    }
}
```

## Archivo: backend/Controllers/InversionesController.cs
```
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InversionesController : ControllerBase
{
    private readonly GreenFixDbContext _context;

    public InversionesController(GreenFixDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var inversiones = await _context.Inversiones.OrderBy(i => i.InversionID).ToListAsync();
        return Ok(inversiones);
    }

    [HttpGet("proyecto/{proyectoId}")]
    public async Task<IActionResult> GetByProyecto(int proyectoId)
    {
        var inversiones = await _context.Inversiones.Where(i => i.ProyectoID == proyectoId).ToListAsync();
        return Ok(inversiones);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Inversion inversion)
    {
        if (inversion == null) return BadRequest();
        _context.Inversiones.Add(inversion);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = inversion.InversionID }, inversion);
    }
}
```

