import logo from "../assets/logo.svg";
import { LogOut, UserRound, PlusCircle, LayoutDashboard } from "lucide-react";
import Button from "./ui/Button";
import WalletConnect from "./WalletConnect";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const {
    activeView,
    setActiveView,
    user,
    openLogin,
    logout,
    startCreateProject,
  } = useApp();

  const isCreator = user?.activeRole === "creator";
  const isInvestor = user?.activeRole === "investor";

  return (
    <nav className="sticky top-0 z-50 flex flex-col items-center justify-between gap-4 glass-nav px-8 py-4 md:flex-row">
      {/* Branding / Logo */}
      <div
        onClick={() => setActiveView("home")}
        className="flex cursor-pointer items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03]"
        title="Volver al inicio"
      >
        <img
          src={logo}
          alt="GreenFix Logo"
          className="h-14 w-auto drop-shadow-lg"
        />

        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white tracking-tight">
            GreenFix
          </span>
          <span className="text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
            Alpha v1.0
          </span>
        </div>
      </div>

      {/* Menú de Acciones Centrales / Derecha */}
      <div className="flex flex-col items-center gap-4 sm:flex-row w-full md:w-auto justify-end">
        
        {/* Acciones del Usuario Autenticado */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Dashboard Link */}
            <Button
              variant={activeView === "dashboard" ? "primary" : "secondary"}
              onClick={() => setActiveView("dashboard")}
              className="gap-2 text-sm"
            >
              <LayoutDashboard size={16} />
              Mi Panel
            </Button>

            {/* Crear Proyecto (Exclusivo Creadores) */}
            {isCreator && (
              <Button
                variant={activeView === "createProject" ? "primary" : "secondary"}
                onClick={startCreateProject}
                className="gap-2 text-sm border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <PlusCircle size={16} />
                Nuevo Proyecto
              </Button>
            )}

            {/* Perfil Mini / Badge de Rol */}
            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.02] border border-white/5 p-1.5 pl-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white max-w-[100px] truncate">
                  {user.nombre || user.correo?.split("@")[0]}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-primary">
                  {user.activeRole === "creator" ? "Negociador" : "Inversor"}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="rounded-xl p-2 text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Cerrar Sesión Web2"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Botón de Ingreso cuando no está autenticado */
          <Button onClick={openLogin} variant="secondary" className="gap-2 text-sm">
            <UserRound size={16} />
            Iniciar Sesión
          </Button>
        )}

        {/* Componente Web3 de Wallet */}
        <div className="border-t border-white/5 pt-4 sm:border-t-0 sm:pt-0">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
