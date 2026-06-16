import { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import Button from "./ui/Button";

export default function KycModal() {
  const { kycModalOpen, closeKycModal, verifyKyc } = useApp();
  
  const [documento, setDocumento] = useState("");
  const [pais, setPais] = useState("");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!kycModalOpen) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleApprove = async () => {
    if (!documento || !pais || !accepted) return;
    
    setVerifying(true);
    
    // Simulamos un delay de red/análisis de la IA de GreenFix antes de guardar
    setTimeout(async () => {
      try {
        await verifyKyc();
        closeKycModal();
        // Reset local
        setDocumento("");
        setPais("");
        setFileName("");
        setPreview(null);
        setAccepted(false);
      } catch (err) {
        console.error(err);
      } finally {
        setVerifying(false);
      }
    }, 1500);
  };

  const canSubmit = documento && pais && accepted && !verifying;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f12] p-8 shadow-2xl">
        
        {/* Botón Cerrar */}
        <button
          onClick={closeKycModal}
          disabled={verifying}
          className="absolute top-4 right-4 rounded-xl p-2 text-text-muted hover:bg-white/5 hover:text-white transition-colors disabled:opacity-30"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-primary" size={24} />
            Verificación de Identidad (KYC)
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Como medida de seguridad del protocolo y cumplimiento legal, requerimos validar tu identidad antes de permitirte publicar proyectos en la blockchain.
          </p>
        </div>

        {/* Inputs en Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Número de Documento / Pasaporte</label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ej. V-12345678 o Pasaporte"
                className="input-field w-full"
                disabled={verifying}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">País de Residencia</label>
              <input
                type="text"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                placeholder="Ej. Venezuela"
                className="input-field w-full"
                disabled={verifying}
              />
            </div>
          </div>

          {/* Zona de Arrastre de Archivo / Imagen */}
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Foto del documento / ID</label>
            <label className={`mt-1 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-white/[0.03] text-text-secondary transition-all hover:bg-white/[0.05] ${preview ? 'border-primary/40' : 'border-white/20'}`}>
              {preview ? (
                <img src={preview} alt="Documento" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <>
                  <Upload size={24} className="text-text-muted" />
                  <span className="text-sm font-medium">Subir imagen ID</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={verifying} />
            </label>
            {fileName && <p className="mt-2 truncate text-xs text-text-muted px-1">{fileName}</p>}
          </div>
        </div>

        {/* Disclaimer / Checkbox */}
        <label className="mt-6 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-xs text-text-secondary select-none cursor-pointer hover:border-white/10 transition-colors">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-white/20 bg-transparent text-primary focus:ring-0"
            disabled={verifying}
          />
          <span>Declaro que la información proveída es fidedigna y autorizo la auditoría de mi rol de Negociador (Simulación Demo para entorno de pruebas).</span>
        </label>

        {/* Acción Aprobación */}
        <Button onClick={handleApprove} className="mt-6 w-full gap-2" disabled={!canSubmit}>
          <CheckCircle2 size={18} />
          {verifying ? "Verificando Identidad..." : "Enviar y Aprobar KYC"}
        </Button>
      </div>
    </div>
  );
}
