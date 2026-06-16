import { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, LogIn, UserPlus } from "lucide-react";
import Button from "./ui/Button";

export default function AuthModal() {
  const { loginOpen, closeLogin, login, register } = useApp();
  
  const [isRegister, setIsRegister] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [roleSelection, setRoleSelection] = useState("investor"); // 'investor' o 'creator'
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!loginOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!nombre || !correo || !password) {
          throw new Error("Por favor completa todos los campos.");
        }
        await register(correo, password, nombre, roleSelection);
      } else {
        if (!correo || !password) {
          throw new Error("Por favor ingresa correo y contraseña.");
        }
        await login(correo, password);
      }
      // Limpiar formulario y cerrar al tener éxito
      resetForm();
      closeLogin();
    } catch (err) {
      setError(err.message || "Ocurrió un error en la autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCorreo("");
    setPassword("");
    setNombre("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f12] p-8 shadow-2xl">
        
        {/* Botón Cerrar */}
        <button
          onClick={() => { resetForm(); closeLogin(); }}
          className="absolute top-4 right-4 rounded-xl p-2 text-text-muted hover:bg-white/5 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Título */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? "Crear Cuenta en GreenFix" : "Bienvenido de nuevo"}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {isRegister ? "Regístrate para fondear o proponer hitos" : "Ingresa tus credenciales tradicionales"}
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. John Doe"
                className="input-field w-full"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full"
            />
          </div>

          {/* Selección de Rol (Solo en registro) */}
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">Selecciona tu Rol Inicial</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoleSelection("investor")}
                  className={`p-3 rounded-2xl border text-sm font-semibold transition-all ${
                    roleSelection === "investor"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.02] text-text-secondary hover:border-white/20"
                  }`}
                >
                  Inversor
                </button>
                <button
                  type="button"
                  onClick={() => setRoleSelection("creator")}
                  className={`p-3 rounded-2xl border text-sm font-semibold transition-all ${
                    roleSelection === "creator"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.02] text-text-secondary hover:border-white/20"
                  }`}
                >
                  Negociador / Creador
                </button>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <Button type="submit" variant="primary" className="w-full mt-6 gap-2" disabled={loading}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? "Procesando..." : isRegister ? "Registrarse" : "Ingresar"}
          </Button>
        </form>

        {/* Toggle Modo */}
        <div className="mt-6 text-center text-xs text-text-secondary">
          {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta aún?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="font-bold text-primary hover:underline ml-1"
          >
            {isRegister ? "Inicia Sesión" : "Regístrate aquí"}
          </button>
        </div>

      </div>
    </div>
  );
}
