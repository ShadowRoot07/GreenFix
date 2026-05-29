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
