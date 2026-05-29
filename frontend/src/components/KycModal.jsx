import { useState } from "react";
import { ShieldCheck, Upload, X, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function KycModal() {
  const { kycModalOpen, closeKycModal, approveKyc, setActiveView, user } = useApp();

  const [fullName, setFullName] = useState("");
  const [docId, setDocId] = useState("");
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!kycModalOpen) return null;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    // Solo lectura local para previsualizar; no se sube a ningún servidor.
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  const canSubmit = fullName.trim() && docId.trim() && preview && accepted && !verifying;

  function handleApprove() {
    if (!canSubmit) return;
    setVerifying(true);
    // Simulación: pequeño retardo para imitar un proceso de verificación.
    setTimeout(() => {
      approveKyc();
      setVerifying(false);
      setActiveView("create");
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-4 backdrop-blur">
      <Card className="w-full max-w-2xl p-6" hoverEffect={false}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Verificación KYC</h2>
              <p className="text-sm text-text-secondary">
                Simulación local. {user?.name ? `Hola, ${user.name}. ` : ""}Verifícate para poder crear proyectos.
              </p>
            </div>
          </div>
          <button onClick={closeKycModal} className="rounded-full p-2 text-text-secondary hover:bg-white/10 hover:text-white">
            <X />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-field">Nombre completo</label>
            <input className="input-field" placeholder="Como aparece en tu documento" value={fullName} onChange={(e) => setFullName(e.target.value)} />

            <label className="label-field mt-4">Número de documento</label>
            <input className="input-field" placeholder="Ej: 1234567 SC" value={docId} onChange={(e) => setDocId(e.target.value)} />
          </div>

          <div>
            <label className="label-field">Foto del documento / ID</label>
            <label className="mt-1 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-text-secondary hover:border-primary/40">
              {preview ? (
                <img src={preview} alt="Documento" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <>
                  <Upload />
                  <span className="text-sm">Subir imagen</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {fileName && <p className="mt-2 truncate text-xs text-text-muted">{fileName}</p>}
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-text-secondary">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
          Declaro que la información es verídica (simulación para el demo; no se envían datos a ningún servidor).
        </label>

        <Button onClick={handleApprove} className="mt-5 w-full" disabled={!canSubmit}>
          <CheckCircle2 size={18} />
          {verifying ? "Verificando..." : "Aprobar verificación"}
        </Button>
      </Card>
    </div>
  );
}
