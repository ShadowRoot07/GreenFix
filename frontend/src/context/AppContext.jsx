import { createContext, useContext, useEffect, useState } from "react";
import { connectMetaMask, createProject as createProjectOnChain, invest as investOnChain } from "../blockchain/web3Service";
const AppContext = createContext();

const defaultInvestorProjects = [
  {
    id: "inv-1",
    name: "Eco Café Santa Cruz",
    description: "Expansión de cafetería saludable con productos orgánicos y empaques sostenibles.",
    goal: 1000,
    raised: 650,
    interest: 6,
    risk: "Medio",
    status: "Funding",
    creator: "Eco Café",
    category: "Alimentos",
    evidence: "ipfs://evidencia-eco-cafe",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=900",
    daysLeft: 16,
    milestones: [
      {
        id: "m1",
        title: "Compra de insumos",
        description: "Adquisición de materia prima, empaques y equipamiento inicial.",
        percentage: 30,
        status: "Voting",
      },
      {
        id: "m2",
        title: "Ampliación del local",
        description: "Adecuación del espacio y compra de mobiliario.",
        percentage: 30,
        status: "Funding",
      },
    ],
  },
  {
    id: "inv-2",
    name: "Huerto Urbano Verde",
    description: "Producción local de verduras para restaurantes saludables de Santa Cruz.",
    goal: 2500,
    raised: 1000,
    interest: 8,
    risk: "Bajo",
    status: "Funding",
    creator: "Huerto Urbano",
    category: "Agricultura",
    evidence: "ipfs://evidencia-huerto",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=900",
    daysLeft: 22,
    milestones: [
      {
        id: "m1",
        title: "Sistema de riego",
        description: "Instalación de riego y preparación del terreno.",
        percentage: 30,
        status: "Voting",
      },
    ],
  },
  {
    id: "inv-3",
    name: "Delivery Sustentable",
    description: "Servicio de entrega ecológica para pequeños negocios locales.",
    goal: 1800,
    raised: 1440,
    interest: 7,
    risk: "Medio",
    status: "Active",
    creator: "Green Delivery",
    category: "Logística",
    evidence: "ipfs://evidencia-delivery",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=900",
    daysLeft: 8,
    milestones: [
      {
        id: "m1",
        title: "Compra de bicicletas",
        description: "Compra de bicicletas eléctricas y equipamiento de reparto.",
        percentage: 30,
        status: "Voting",
      },
    ],
  },
];

const users = [
  {
    id: 1,
    name: "Maycol",
    email: "inversor@gmail.com",
    password: "12345",
    walletAddress: "",
    roles: ["investor"],
  },
  {
    id: 2,
    name: "Negociador GreenFix",
    email: "negociador@gmail.com",
    password: "12345",
    walletAddress: "",
    roles: ["creator"],
  },
];

function getSaved(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function calculateInterest(goal) {
  const amount = Number(goal);

  if (amount <= 1000) return 6;
  if (amount <= 2500) return 8;
  return 10;
}

export function AppProvider({ children }) {
  const [account, setAccount] = useState(() => getSaved("greenfix-account", ""));
  const [walletLoading, setWalletLoading] = useState(false);
  const [user, setUser] = useState(() => getSaved("greenfix-user", null));
  const [authError, setAuthError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const [activeView, setActiveView] = useState(() =>
    getSaved("greenfix-active-view", "home")
  );

  const [selectedProject, setSelectedProject] = useState(() =>
    getSaved("greenfix-selected-project", null)
  );

  const [investorProjects, setInvestorProjects] = useState(() =>
    getSaved("greenfix-investor-projects", defaultInvestorProjects)
  );

  const [creatorProjects, setCreatorProjects] = useState(() =>
    getSaved("greenfix-creator-projects", [])
  );

  const [votes, setVotes] = useState(() => getSaved("greenfix-votes", {}));

  useEffect(() => {
    localStorage.setItem("greenfix-user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("greenfix-account", JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem("greenfix-active-view", JSON.stringify(activeView));
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem("greenfix-selected-project", JSON.stringify(selectedProject));
  }, [selectedProject]);

  useEffect(() => {
    localStorage.setItem("greenfix-investor-projects", JSON.stringify(investorProjects));
  }, [investorProjects]);

  useEffect(() => {
    localStorage.setItem("greenfix-creator-projects", JSON.stringify(creatorProjects));
  }, [creatorProjects]);

  useEffect(() => {
    localStorage.setItem("greenfix-votes", JSON.stringify(votes));
  }, [votes]);

  function openLogin() {
    setAuthError("");
    setLoginOpen(true);
  }

  function closeLogin() {
    setLoginOpen(false);
  }

  function login(email, password, selectedRole) {
    setAuthError("");

    const foundUser = users.find(
      (item) =>
        item.email === email &&
        item.password === password &&
        item.roles.includes(selectedRole)
    );

    if (!foundUser) {
      setAuthError("Correo, contraseña o rol incorrecto");
      return false;
    }

    const session = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      roles: foundUser.roles,
      walletAddress: foundUser.walletAddress,
      activeRole: selectedRole,
    };

    setUser(session);
    setActiveView("dashboard");
    setLoginOpen(false);

    return true;
  }

  function logout() {
    setUser(null);
    setActiveView("home");
    setSelectedProject(null);
    localStorage.removeItem("greenfix-user");
    localStorage.removeItem("greenfix-active-view");
    localStorage.removeItem("greenfix-selected-project");
  }

  async function connectWallet() {
    setWalletLoading(true);

    try {
      const wallet = await connectMetaMask();
      setAccount(wallet);
    } catch {
      setAccount("0x1234...ABCD");
    } finally {
      setWalletLoading(false);
    }
  }

  function disconnectWallet() {
    setAccount("");
  }

  async function createProject({ name, goal, description }) {
  try {
    // 1. Crear en blockchain (MetaMask pedirá confirmación)
    const result = await createProjectOnChain(
      goal,
      600,              // 6% interés
      30,               // 30 días
      7 * 24 * 3600,    // intervalo 7 días
      "ipfs://" + name  // metadata simple
    );

    // 2. Guardar en backend
    await fetch("http://localhost:5029/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: name,
        descripcion: description,
        montoObjetivo: Number(goal),
        montoActual: 0,
        interes: 6,
        duracionMeses: 1,
        garantia: Number(goal) * 0.05,
        contractAddress: result.projectAddress || "0xPendiente",
        estado: "Funding",
        emprendedorId: 1
      })
    });

    // 3. Agregar a la lista local
    const newProject = {
      id: `cre-${Date.now()}`,
      name,
      description,
      goal: Number(goal),
      raised: 0,
      interest: 6,
      status: "Funding",
      contractAddress: result.projectAddress,
      milestones: [],
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=900",
    };

    setCreatorProjects((prev) => [...prev, newProject]);
    setActiveView("dashboard");
    alert("✅ Proyecto creado en blockchain y guardado!");

  } catch (error) {
    console.error(error);
    alert("❌ Error: " + error.message);
  }
}

  function deleteCreatorProject(projectId) {
    setCreatorProjects((prev) => prev.filter((project) => project.id !== projectId));
    setSelectedProject(null);
    setActiveView("dashboard");
  }

async function invest(projectId, amount) {
  console.log("Invirtiendo:", amount, "USDC");
  const value = Number(amount);
  if (!value || value <= 0) {
    alert("Ingrese un monto válido");
    return;
  }

  try {
    const project = investorProjects.find(p => p.id === projectId) || 
                    creatorProjects.find(p => p.id === projectId);
    
    if (!project || !project.contractAddress) {
      alert("Proyecto no encontrado o sin contrato");
      return;
    }

    // Invertir en blockchain
    await investOnChain(project.contractAddress, amount);
    const updatedProjects = investorProjects.map((p) =>
      p.id === projectId
        ? { ...p, raised: (p.raised || 0) + value }
        : p
    );

    // Actualizar lista de proyectos
    setInvestorProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, raised: (p.raised || 0) + value }
          : p
      )
    );

    // Actualizar proyecto seleccionado
    setSelectedProject((prev) =>
      prev && prev.id === projectId
        ? { ...prev, raised: (prev.raised || 0) + value }
        : prev
    );

    try {
      await fetch("http://localhost:5029/api/inversiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoID: 1,
          usuarioID: 1,
          montoInvertido: value,
          tokensAsignados: value
        })
      });
    } catch (e) {
      console.log("Backend no disponible, pero inversión OK");
    }

    alert("✅ Inversión realizada!");
  } catch (error) {
    console.error(error);
    alert("❌ Error: " + error.message);
  }
}

  function openProject(project) {
    setSelectedProject(project);
    setActiveView("detail");
  }

  function vote(projectId, support) {
    setVotes((prev) => {
      const current = prev[projectId] || { for: 12, against: 4 };

      return {
        ...prev,
        [projectId]: {
          for: support ? current.for + 1 : current.for,
          against: support ? current.against : current.against + 1,
        },
      };
    });
  }

  const visibleProjects = [...investorProjects, ...creatorProjects];

  return (
    <AppContext.Provider
      value={{
        account,
        walletLoading,
        user,
        authError,
        loginOpen,
        activeView,
        selectedProject,
        investorProjects,
        creatorProjects,
        visibleProjects,
        votes,
        setActiveView,
        openLogin,
        closeLogin,
        login,
        logout,
        connectWallet,
        disconnectWallet,
        createProject,
        deleteCreatorProject,
        invest,
        openProject,
        vote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
