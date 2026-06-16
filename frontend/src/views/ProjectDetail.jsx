import { useState } from "react";
import { ArrowLeft, Calendar, Globe, Shield, CheckCircle2, Clock, Circle, Lock, FileClock, Sparkles, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
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
      <section className="px-8 py-16 md:px-20 text-center">
        <p className="text-text-secondary text-lg">No hay proyecto seleccionado.</p>
        <Button onClick={() => setActiveView("dashboard")} className="mt-4">Volver al Panel</Button>
      </section>
    );
  }

  const isCreator = user?.activeRole === "creator";
  const progress = Math.min((project.raised / project.goal) * 100, 100);
  const remaining = Math.max(project.goal - project.raised, 0);
  const fundingReached = project.raised >= project.goal;

  const handleInvest = async () => {
    if (!amount || Number(amount) < 10) return alert("La inversión mínima es de 10 USDC");
    const ok = await invest(project.contractAddress, amount);
    if (ok) setAmount("");
  };

  return (
    <section className="min-h-[80vh] bg-radial-green px-4 py-12 md:px-12 lg:px-20">
      {/* Botón Volver */}
      <button
        onClick={() => setActiveView("dashboard")}
        className="mb-8 flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors group"
      >
        <ArrowLeft size={18} className="transform transition-transform group-hover:-translate-x-1" />
        Volver a proyectos
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* COLUMNA PRINCIPAL DE DETALLES */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* TARJETA PRINCIPAL DEL PROYECTO */}
          <Card className="overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <div className="relative h-80 w-full overflow-hidden">
              <img src={project.image} alt={project.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4">
                <BadgeStatus status={project.status} />
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{project.name}</h2>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">{project.description}</p>

              {/* Badges de Metadata */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <Shield size={14} className="text-primary" />
                  Evidencia IPFS
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <Calendar size={14} className="text-secondary" />
                  Hito actual: {project.currentMilestone + 1}/{project.milestones.length || 4}
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <Globe size={14} className="text-emerald-400" />
                  Red local Hardhat
                </span>
              </div>

              {/* Indicadores Financieros */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05]">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Meta Objetivo</p>
                  <p className="mt-1 text-2xl font-black text-white">{project.goal.toLocaleString()} <span className="text-xs text-text-muted">USDC</span></p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05]">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Recaudado</p>
                  <p className="mt-1 text-2xl font-black text-primary">{project.raised.toLocaleString()} <span className="text-xs text-primary/70">USDC</span></p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05]">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Interés Anual</p>
                  <p className="mt-1 text-2xl font-black text-secondary">{project.interest}%</p>
                </div>
              </div>

              {/* Barra de Progreso del Funding */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-bold font-mono text-text-muted mb-1.5">
                  <span>Progreso de Financiamiento</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10 p-[1px]">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary via-[#a855f7] to-secondary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col gap-1 rounded-xl bg-black/30 p-3 border border-white/5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Dirección del Contrato Escrow</span>
                <p className="font-mono text-xs text-primary break-all">{project.contractAddress}</p>
              </div>
            </div>
          </Card>

          {/* SECCIÓN DE HITOS (MILESTONES) & GOBERNANZA */}
          <Card className="p-6 md:p-8 border border-white/5 bg-white/[0.02]">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-white tracking-tight">Evolución por Hitos</h3>
              <p className="text-sm text-text-secondary mt-1">El capital se libera bajo auditoría democrática de los inversores.</p>
            </div>

            <div className="space-y-4">
              {project.milestones.length === 0 && (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <p className="text-sm text-text-secondary">Los milestones se generarán automáticamente al completar el funding.</p>
                </div>
              )}

              {project.milestones.map((m, index) => {
                const Icon = milestoneIcon(m.status);
                const isActive = m.status === "Voting" || (project.currentMilestone === index && m.status === "Pending");
                
                return (
                  <div 
                    key={m.id} 
                    className={`rounded-2xl border transition-all p-5 backdrop-blur-md ${
                      m.status === "Completed" ? "border-emerald-500/20 bg-emerald-950/5 opacity-80" :
                      m.status === "Voting" ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(34,197,94,0.05)] animate-pulse" :
                      isActive ? "border-secondary/40 bg-white/[0.04]" : "border-white/5 bg-white/[0.01] opacity-40"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex gap-4 items-start">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold border ${
                          m.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          m.status === "Voting" ? "bg-primary/20 text-primary border-primary/30" :
                          "bg-white/5 text-text-muted border-white/10"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white flex items-center gap-2">
                            {m.title}
                            {m.status === "Voting" && <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-md bg-primary/20 text-primary tracking-wider">Votación Activa</span>}
                          </h4>
                          <p className="mt-1 text-xs md:text-sm text-text-secondary leading-relaxed">{m.description}</p>
                          {m.evidenceURI && (
                            <a href={m.evidenceURI} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-secondary hover:underline">
                              <Shield size={12} /> Evidencia: {m.evidenceURI}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0">
                        <BadgeStatus status={m.status} />
                        <span className="font-mono font-bold text-sm text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">{m.percentage}%</span>
                      </div>
                    </div>

                    {/* INTERFAZ DE GOBERNANZA WEB3 PARA HITOS EN VOTACIÓN */}
                    {m.votingActive && (() => {
                      const supply = project.tokenTotalSupply || 0;
                      const participacion = supply > 0 ? ((m.votesFor + m.votesAgainst) / supply) * 100 : 0;
                      const aprobacion = (m.votesFor + m.votesAgainst) > 0 ? (m.votesFor / (m.votesFor + m.votesAgainst)) * 100 : 0;
                      const QUORUM = 51;
                      
                      return (
                        <div className="mt-5 border-t border-white/5 pt-4 bg-black/20 rounded-xl p-4 border border-white/5">
                          <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-bold">
                            <div className="flex items-center gap-2 text-primary bg-primary/5 p-2 rounded-xl border border-primary/10">
                              <ThumbsUp size={14} />
                              <span>A favor: {m.votesFor.toLocaleString()} <span className="text-[10px] opacity-60">Votos</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/5 p-2 rounded-xl border border-red-400/10">
                              <ThumbsDown size={14} />
                              <span>En contra: {m.votesAgainst.toLocaleString()} <span className="text-[10px] opacity-60">Votos</span></span>
                            </div>
                          </div>

                          {/* Quórum de Gobernanza */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-text-muted">
                              <span className="flex items-center gap-1"><AlertCircle size={12} /> Participación: {participacion.toFixed(1)}%</span>
                              <span>Quórum Mínimo: {QUORUM}%</span>
                            </div>
                            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#a855f7] transition-all" style={{ width: `${Math.min(participacion, 100)}%` }}></div>
                              <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-400" style={{ left: `${QUORUM}%` }} title="Línea de Quórum"></div>
                            </div>
                          </div>

                          <p className="mt-3 text-[11px] text-text-muted leading-relaxed">
                            Aprobación: <span className="font-bold text-white">{aprobacion.toFixed(1)}%</span> de los votos emitidos. El peso es 1:1 respecto a tu inversión en USDC.
                          </p>

                          {/* Acciones de Voto Dinámicas */}
                          <div className="mt-4 pt-2 border-t border-white/5">
                            {!isCreator ? (
                              <div className="flex gap-3">
                                <Button className="w-full text-xs font-bold gap-1.5" disabled={txPending} onClick={() => vote(project.contractAddress, m.id, true)}>
                                  <ThumbsUp size={14} /> Votar A Favor
                                </Button>
                                <Button variant="danger" className="w-full text-xs font-bold gap-1.5" disabled={txPending} onClick={() => vote(project.contractAddress, m.id, false)}>
                                  <ThumbsDown size={14} /> Votar En Contra
                                </Button>
                              </div>
                            ) : (
                              <Button variant="secondary" className="w-full text-xs font-bold border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20" disabled={txPending} onClick={() => finalizeVoting(project.contractAddress, m.id)}>
                                {txPending ? "Procesando..." : "Finalizar y Cerrar Escrutinio"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Panel de Solicitud de Hitos para el Creador */}
            {isCreator && project.status === "Active" && project.currentMilestone < project.milestones.length && (
              <div className="mt-6 border-t border-white/10 pt-6 bg-white/[0.01] rounded-2xl p-4 border border-white/5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Evidencia de Cumplimiento (URL / IPFS)</label>
                <input className="input-field w-full" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="ipfs://Qm..." />
                <Button className="mt-4 w-full text-sm font-bold" disabled={txPending} onClick={() => requestMilestone(project.contractAddress, evidence)}>
                  {txPending ? "Enviando Solicitud..." : `Solicitar Liberación de Fondos del Hito ${project.currentMilestone + 1}`}
                </Button>
              </div>
            )}
          </Card>

          {/* BITÁCORA / ACTUALIZACIONES FUTURAS */}
          <Card className="relative overflow-hidden p-6 md:p-8 border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                <FileClock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Actualizaciones / Comprobantes</h3>
                <p className="text-xs text-text-secondary">Bitácora de avances verificables.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] py-10 text-center">
              <Sparkles className="text-primary animate-bounce" size={20} />
              <p className="text-base font-bold text-white">Módulo de Auditoría Extendida</p>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">Próximamente</span>
            </div>
          </Card>

          {/* SECCIÓN DE CUOTAS (REPAYMENTS) PARA CREADORES */}
          {isCreator && project.repayments.length > 0 && (
            <Card className="p-6 border border-white/5 bg-white/[0.02]">
              <h3 className="mb-4 text-xl font-bold text-white">Cronograma de Reembolsos de Crédito</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {project.repayments.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-secondary">Cuota #{r.id + 1}</span>
                      <span className="text-sm font-bold text-white font-mono">{r.amount.toFixed(2)} USDC</span>
                    </div>
                    {r.paid ? (
                      <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg">Pagada ✓</span>
                    ) : (
                      <Button variant="secondary" className="text-xs font-bold py-1.5 px-3" disabled={txPending || project.status !== "Active"} onClick={() => makeRepayment(project.contractAddress, r.id)}>
                        Pagar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* COLUMNA LATERAL: PANELES DE ACCIÓN RÁPIDA (ESCROW) */}
        <div className="space-y-6">
          
          {/* PANEL DE INVERSIÓN (FONDOS) */}
          {!isCreator && project.status === "Funding" && (
            <Card className="p-6 border border-primary/20 bg-primary/[0.02] shadow-[0_0_20px_rgba(34,197,94,0.02)]">
              <h3 className="text-xl font-bold text-white tracking-tight">Participar en la Meta</h3>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Faltan <span className="font-mono font-bold text-primary">{remaining.toLocaleString()} USDC</span> para cerrar la ronda. Inversión mínima establecida: <span className="font-bold text-white">10 USDC</span>.
              </p>
              <div className="relative mt-4">
                <input
                  className="input-field w-full pr-16 font-mono font-bold"
                  type="number"
                  min="10"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={txPending}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-text-muted">USDC</span>
              </div>
              <Button onClick={handleInvest} className="mt-4 w-full text-sm font-bold py-3" disabled={txPending}>
                {txPending ? "Confirmando en Wallet..." : "Firmar Inversión"}
              </Button>
            </Card>
          )}

          {/* RECLAMO DE RECOMPENSAS / RENDIMIENTOS */}
          {!isCreator && project.status === "Completed" && (
            <Card className="p-6 border border-emerald-500/20 bg-emerald-500/[0.01]">
              <h3 className="text-xl font-bold text-white">Rendimiento Completado</h3>
              <p className="mt-2 text-xs text-text-secondary">El ciclo del proyecto finalizó exitosamente. Retira tu capital aportado más los intereses devengados.</p>
              <Button className="mt-4 w-full text-sm font-bold" variant="primary" disabled={txPending} onClick={() => claimRewards(project.contractAddress)}>
                Reclamar Dividendos
              </Button>
            </Card>
          )}

          {/* RECLAMO DE REEMBOLSOS (FALLAS / INCUMPLIMIENTO) */}
          {!isCreator && project.status === "Refunding" && (
            <Card className="p-6 border border-red-500/20 bg-red-500/[0.01]">
              <h3 className="text-xl font-bold text-red-400">Protección contra Riesgo</h3>
              <p className="mt-2 text-xs text-text-secondary">El protocolo ha activado la ventana de reembolso. Recupera los fondos remanentes que no fueron liberados.</p>
              <Button className="mt-4 w-full text-sm font-bold" variant="danger" disabled={txPending} onClick={() => claimRefund(project.contractAddress)}>
                Reclamar Reembolso Proporcional
              </Button>
            </Card>
          )}

          {/* GESTIÓN DE CIERRE DE FUNDING PARA EL NEGOCIADOR */}
          {isCreator && project.status === "Funding" && (
            <Card className="p-6 border border-white/10 bg-white/[0.01]">
              <h3 className="text-xl font-bold text-white">Etapa de Financiamiento</h3>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                {fundingReached
                  ? "¡Meta financiera completada! Debes declarar la inicialización del proyecto para estructurar las ventanas on-chain de gobernanza."
                  : `Ronda comercial activa. Restan acumular ${remaining.toLocaleString()} USDC para poder proceder con el despliegue funcional.`}
              </p>
              <Button className="mt-4 w-full text-sm font-bold" disabled={txPending || !fundingReached} onClick={() => finalizeFunding(project.contractAddress)}>
                Activar Protocolo de Hitos
              </Button>
            </Card>
          )}

          {/* RESUMEN DEL ESTADO INTEGRAL ON-CHAIN */}
          <Card className="p-5 border border-white/5 bg-black/40">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Trazabilidad Contractual</h3>
            <div className="space-y-2.5 text-xs font-semibold text-text-secondary">
              <div className="flex justify-between items-center">
                <span>Estado del Ciclo</span>
                <BadgeStatus status={project.status} />
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span>Garantía de Creador (5%)</span>
                <span className={project.guaranteeDeposited ? "text-primary font-bold" : "text-text-muted"}>
                  {project.guaranteeDeposited ? "Depositada ✓" : "Pendiente"}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span>Hito de Ejecución</span>
                <span className="font-mono text-white font-bold">{project.currentMilestone + 1} de {project.milestones.length || 4}</span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
