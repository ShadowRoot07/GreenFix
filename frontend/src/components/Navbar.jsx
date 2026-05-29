import logo from "../assets/logo.svg";
import { LogOut, UserRound } from "lucide-react";
import WalletConnect from "./WalletConnect";
import Button from "./ui/Button";
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
    <span className="text-2xl font-black text-white">
      GreenFix
    </span>
    
    {/* El Badge de Alpha */}
    <span className="text-[10px]  tracking-wider uppercase font-black text-white">
      Alpha
    </span>
  </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {user && (
          <button
            onClick={() => setActiveView("dashboard")}
            className={`transition-all duration-300 hover:-translate-y-1 ${
              activeView === "dashboard"
                ? "font-bold text-primary"
                : "font-medium text-text-secondary hover:text-primary"
            }`}
          >
            Dashboard
          </button>
        )}

        {user && isCreator && (
          <button
            onClick={startCreateProject}
            className={`transition-all duration-300 hover:-translate-y-1 ${
              activeView === "create"
                ? "font-bold text-primary"
                : "font-medium text-text-secondary hover:text-primary"
            }`}
          >
            Crear proyecto
          </button>
        )}

        {user ? (
          <>
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white">
              <UserRound size={16} className="text-primary" />
              {isInvestor && "Inversor"}
              {isCreator && "Negociador"}
              {" · "}
              {user.name}
            </span>

            <WalletConnect />

            <Button variant="dark" onClick={logout}>
              <LogOut size={18} />
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Button onClick={openLogin}>
            Iniciar sesión
          </Button>
        )}
      </div>
    </nav>
  );
}
