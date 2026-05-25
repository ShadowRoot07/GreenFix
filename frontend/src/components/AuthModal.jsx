import { useState } from "react";
import { Building2, Eye, EyeOff, UserPlus, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function AuthModal() {
  const { loginOpen, closeLogin, login, authError } = useApp();

  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  if (!loginOpen) return null;

  function handleSubmit() {
    if (!selectedRole) {
      alert("Seleccione si ingresará como inversor o negociador");
      return;
    }

    const success = login(email, password, selectedRole);

    if (success) {
      setEmail("");
      setPassword("");
      setSelectedRole("");
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur">
      <Card className="w-full max-w-3xl p-6" hoverEffect={false}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Ingreso a GreenFix</h2>
            <p className="text-text-secondary">
              Elige primero el rol y luego escribe tus datos de acceso.
            </p>
          </div>

          <button
            onClick={closeLogin}
            className="rounded-full p-2 text-text-secondary hover:bg-white/10 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setSelectedRole("investor")}
            className={`rounded-3xl border p-5 text-left transition ${
              selectedRole === "investor"
                ? "border-primary bg-primary/10 shadow-glow-primary"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <UserPlus className="text-primary" />
            <h3 className="mt-3 text-lg font-bold text-white">Soy inversor</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Podrás invertir, revisar proyectos y votar milestones.
            </p>
          </button>

          <button
            onClick={() => setSelectedRole("creator")}
            className={`rounded-3xl border p-5 text-left transition ${
              selectedRole === "creator"
                ? "border-secondary bg-secondary/10 shadow-glow-secondary"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <Building2 className="text-secondary" />
            <h3 className="mt-3 text-lg font-bold text-white">Soy negociador</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Podrás crear proyectos, revisar avances y gestionar tus campañas.
            </p>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="input-field"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                className="input-field pr-12"
                placeholder="Contraseña"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {authError && (
            <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-400">
              {authError}
            </p>
          )}

          <Button onClick={handleSubmit} className="mt-4">
            Entrar
          </Button>

          <div className="mt-4 text-sm text-text-muted">
            <p>Inversor: inversor@gmail.com / 12345</p>
            <p>Negociador: negociador@gmail.com / 12345</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
