import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import ProjectDetail from "./views/ProjectDetail";
import CreateProject from "./views/CreateProject";
import { useApp } from "./context/AppContext";
import logoFondo from './assets/logo.svg'

function App() {
  const { activeView } = useApp();

  return (
    <div className="relative min-h-screen bg-background text-text-primary">
      
      {/* CAPA DEL LOGO: Subimos a z-0 y subimos la opacidad para estar 100% seguros de verlo */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
        <img 
          src={logoFondo} 
          alt="GreenFix Background Logo" 
          className="w-[50%] max-w-2xl object-contain select-none"
        />
      </div>
      <Navbar />
      <AuthModal />

      {activeView === "home" && <Home />}
      {activeView === "dashboard" && <Dashboard />}
      {activeView === "detail" && <ProjectDetail />}
      {activeView === "create" && <CreateProject />}

      <footer className="border-t border-white/10 bg-background px-8 py-6 text-center text-text-muted">
        © 2026 GreenFix - MVP Frontend Web3
      </footer>
    </div>
  );
}

export default App;
