import { useState } from "react";
import { ArrowLeft, Info, Rocket } from "lucide-react";
import { useFactory } from "../hooks/useFactory";
import { useApp } from "../context/AppContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function CreateProject() {
  const { createProject } = useFactory();
  const { setActiveView } = useApp();

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");

  function calculateInterest(amount) {
    const value = Number(amount);

    if (value <= 1000) return 6;
    if (value <= 2500) return 8;
    return 10;
  }

  function handleSubmit() {
    if (!name || !goal || !description) {
      alert("Complete nombre, monto y descripción");
      return;
    }

    createProject({
      name,
      goal,
      description,
    });

    setName("");
    setGoal("");
    setDescription("");

    alert("Proyecto creado correctamente");
  }

  const interest = goal ? calculateInterest(goal) : 0;
  const guarantee = goal ? Number(goal) * 0.05 : 0;

  return (
    <section className="min-h-[70vh] bg-radial-green px-8 py-16 md:px-20">
      <button
        onClick={() => setActiveView("dashboard")}
        className="mb-8 flex items-center gap-2 text-text-secondary hover:text-white"
      >
        <ArrowLeft size={20} />
        Volver al dashboard
      </button>

      <div className="mb-8">
        <h2 className="text-4xl font-black text-white">
          Crear nuevo proyecto
        </h2>
        <p className="mt-3 text-text-secondary">
          Registra un proyecto para buscar financiamiento. El interés se calcula automáticamente.
        </p>
      </div>

      <Card className="max-w-3xl p-8">
        <div className="grid gap-6">
          <div>
            <label className="label-field">Nombre del proyecto</label>
            <input
              className="input-field"
              placeholder="Ej: Café sostenible"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field">Monto solicitado en USDC</label>
            <input
              className="input-field"
              type="number"
              placeholder="Ej: 1500"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
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
              En el MVP, la garantía, IPFS y los contratos están simulados, pero la estructura está preparada para conectarse al backend y a Polygon Amoy.
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Rocket size={18} />
            Crear proyecto
          </Button>
        </div>
      </Card>
    </section>
  );
}
