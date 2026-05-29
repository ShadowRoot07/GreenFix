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
