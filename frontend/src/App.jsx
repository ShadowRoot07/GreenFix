import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import ProjectDetail from "./views/ProjectDetail";
import CreateProject from "./views/CreateProject";
import { useApp } from "./context/AppContext";

function App() {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-background text-text-primary">
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
