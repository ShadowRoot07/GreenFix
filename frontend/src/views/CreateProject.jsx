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
