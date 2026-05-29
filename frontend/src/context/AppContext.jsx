import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  connectMetaMask,
  getUsdcBalance,
  mintUsdc,
  getAllProjects,
  createProject as createProjectOnChain,
  invest as investOnChain,
  vote as voteOnChain,
  finalizeFunding as finalizeFundingOnChain,
  requestMilestoneRelease as requestMilestoneReleaseOnChain,
  finalizeVoting as finalizeVotingOnChain,
  makeRepayment as makeRepaymentOnChain,
  claimRewards as claimRewardsOnChain,
  claimRefund as claimRefundOnChain,
} from "../blockchain/web3Service";

const AppContext = createContext();

const BACKEND_URL = "http://localhost:5029";

// Imágenes de relleno para que las tarjetas se vean bien (la metadata real
// vive en el backend / IPFS; esto es solo presentación).
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=900",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=900",
];

// Usuarios demo (no hay backend de auth en el MVP: el login solo elige el rol).
const users = [
  { id: 1, name: "Maycol", email: "inversor@gmail.com", password: "12345", roles: ["investor"] },
  { id: 2, name: "Negociador GreenFix", email: "negociador@gmail.com", password: "12345", roles: ["creator"] },
];

function getSaved(key, fallback) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

function calculateInterestBps(goal) {
  const amount = Number(goal);
  if (amount <= 1000) return 600; // 6%
  if (amount <= 2500) return 800; // 8%
  return 1000; // 10%
}

function milestoneStatus(milestone, index, currentMilestone) {
  if (milestone.released || index < currentMilestone) return "Completed";
  if (milestone.votingActive) return "Voting";
  if (index === currentMilestone) return "Pending";
  return "Locked";
}

/**
 * Convierte el resumen on-chain en el modelo que consumen las vistas,
 * enriquecido con la metadata del backend cuando está disponible.
 */
function buildProjectModel(chainProject, metadataByAddress, index) {
  const meta = metadataByAddress[chainProject.contractAddress.toLowerCase()] || {};
  const nameFromUri = (chainProject.metadataURI || "").replace("ipfs://", "");
  // Imagen personalizada del negociador; solo se usa un fallback si no hay ninguna.
  const customImage = meta.imagenURL || meta.imagenUrl;

  return {
    id: chainProject.contractAddress,
    projectId: chainProject.projectId,
    contractAddress: chainProject.contractAddress,
    creator: chainProject.creator,
    name: meta.nombre || nameFromUri || `Proyecto #${chainProject.projectId}`,
    description: meta.descripcion || "Proyecto de financiamiento descentralizado en GreenFix.",
    image: customImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    goal: chainProject.goal,
    raised: chainProject.raised,
    interest: chainProject.interest,
    status: chainProject.status,
    state: chainProject.state,
    guaranteeDeposited: chainProject.guaranteeDeposited,
    currentMilestone: chainProject.currentMilestone,
    tokenTotalSupply: chainProject.tokenTotalSupply,
    repayments: chainProject.repayments,
    milestones: chainProject.milestones.map((m, i) => ({
      id: m.id,
      title: `Hito ${i + 1}`,
      description: `Liberación del ${m.percentage}% del capital (${m.amount} USDC).`,
      percentage: m.percentage,
      status: milestoneStatus(m, i, chainProject.currentMilestone),
      released: m.released,
      votingActive: m.votingActive,
      votesFor: m.votesFor,
      votesAgainst: m.votesAgainst,
      evidenceURI: m.evidenceURI,
    })),
  };
}

export function AppProvider({ children }) {
  const [account, setAccount] = useState(() => getSaved("greenfix-account", ""));
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);

  const [user, setUser] = useState(() => getSaved("greenfix-user", null));
  const [authError, setAuthError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  const [activeView, setActiveView] = useState(() => getSaved("greenfix-active-view", "home"));
  const [selectedId, setSelectedId] = useState(() => getSaved("greenfix-selected-id", null));

  // KYC (simulado, local). Mapa { [usuarioId]: true }.
  const [kycMap, setKycMap] = useState(() => getSaved("greenfix-kyc", {}));
  const [kycModalOpen, setKycModalOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // ─────────────── Persistencia ligera de sesión / navegación ───────────────
  useEffect(() => { localStorage.setItem("greenfix-user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("greenfix-account", JSON.stringify(account)); }, [account]);
  useEffect(() => { localStorage.setItem("greenfix-active-view", JSON.stringify(activeView)); }, [activeView]);
  useEffect(() => { localStorage.setItem("greenfix-selected-id", JSON.stringify(selectedId)); }, [selectedId]);
  useEffect(() => { localStorage.setItem("greenfix-kyc", JSON.stringify(kycMap)); }, [kycMap]);

  // ─────────────── Carga de proyectos desde la cadena ───────────────
  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const chainProjects = await getAllProjects();

      // Metadata del backend (opcional, tolerante a que esté caído).
      let metadataByAddress = {};
      try {
        const res = await fetch(`${BACKEND_URL}/api/proyectos`);
        if (res.ok) {
          const data = await res.json();
          metadataByAddress = data.reduce((acc, p) => {
            if (p.contractAddress) acc[p.contractAddress.toLowerCase()] = p;
            return acc;
          }, {});
        }
      } catch {
        /* backend no disponible: seguimos solo con datos on-chain */
      }

      setProjects(chainProjects.map((p, i) => buildProjectModel(p, metadataByAddress, i)));
    } catch (error) {
      console.error("Error cargando proyectos on-chain:", error);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Refrescar saldo USDC cuando cambia la cuenta.
  const refreshBalance = useCallback(async (address) => {
    try {
      setUsdcBalance(await getUsdcBalance(address));
    } catch {
      setUsdcBalance(0);
    }
  }, []);

  useEffect(() => {
    if (account) refreshBalance(account);
  }, [account, refreshBalance]);

  // Reaccionar a cambios de cuenta en MetaMask.
  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts) => setAccount(accounts[0] || "");
    window.ethereum.on?.("accountsChanged", handler);
    return () => window.ethereum.removeListener?.("accountsChanged", handler);
  }, []);

  // ─────────────── Auth (demo local) ───────────────
  function openLogin() { setAuthError(""); setLoginOpen(true); }
  function closeLogin() { setLoginOpen(false); }

  function login(email, password, selectedRole) {
    setAuthError("");
    const found = users.find(
      (u) => u.email === email && u.password === password && u.roles.includes(selectedRole)
    );
    if (!found) {
      setAuthError("Correo, contraseña o rol incorrecto");
      return false;
    }
    setUser({ id: found.id, name: found.name, email: found.email, roles: found.roles, activeRole: selectedRole });
    setActiveView("dashboard");
    setLoginOpen(false);
    return true;
  }

  function logout() {
    setUser(null);
    setActiveView("home");
    setSelectedId(null);
  }

  // ─────────────── KYC (simulado / local) ───────────────
  const kycVerified = user ? Boolean(kycMap[user.id]) : false;

  function openKycModal() { setKycModalOpen(true); }
  function closeKycModal() { setKycModalOpen(false); }

  function approveKyc() {
    if (user) setKycMap((prev) => ({ ...prev, [user.id]: true }));
    setKycModalOpen(false);
  }

  // Lanza la creación solo si el negociador pasó el KYC; si no, abre el modal.
  function startCreateProject() {
    if (!kycVerified) {
      setKycModalOpen(true);
      return;
    }
    setActiveView("create");
  }

  // ─────────────── Wallet ───────────────
  async function connectWallet() {
    setWalletLoading(true);
    try {
      const wallet = await connectMetaMask();
      setAccount(wallet);
    } catch (error) {
      alert("❌ No se pudo conectar la wallet: " + error.message);
    } finally {
      setWalletLoading(false);
    }
  }

  function disconnectWallet() {
    setAccount("");
    setUsdcBalance(0);
  }

  async function requestFaucet(amount = 5000) {
    if (!account) return alert("Conecta tu wallet primero");
    setTxPending(true);
    try {
      await mintUsdc(amount);
      await refreshBalance(account);
      alert(`✅ Recibiste ${amount} USDC de prueba`);
    } catch (error) {
      alert("❌ Faucet falló: " + (error.shortMessage || error.message));
    } finally {
      setTxPending(false);
    }
  }

  // ─────────────── Acciones on-chain ───────────────
  async function runTx(fn, successMsg) {
    if (!account) {
      alert("Conecta tu wallet primero");
      return false;
    }
    setTxPending(true);
    try {
      await fn();
      await loadProjects();
      if (account) await refreshBalance(account);
      if (successMsg) alert(successMsg);
      return true;
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.shortMessage || error.reason || error.message));
      return false;
    } finally {
      setTxPending(false);
    }
  }

  async function createProject({ name, goal, description, durationDays, imageUrl }) {
    if (!account) {
      alert("Conecta tu wallet primero");
      return;
    }
    if (!kycVerified) {
      setKycModalOpen(true);
      return;
    }
    setTxPending(true);
    try {
      const interestBps = calculateInterestBps(goal);
      // Duración elegida por el negociador (entre 1 semana y 6 meses).
      const days = Math.min(Math.max(Number(durationDays) || 30, 7), 180);
      // Cuotas: semanales para plazos cortos, mensuales para plazos largos.
      const repaymentInterval = days <= 30 ? 7 * 24 * 3600 : 30 * 24 * 3600;

      const result = await createProjectOnChain(
        goal,
        interestBps,
        days,
        repaymentInterval,
        `ipfs://${name}`
      );

      // Guardar metadata en el backend (tolerante a fallos).
      try {
        await fetch(`${BACKEND_URL}/api/proyectos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: name,
            descripcion: description,
            montoObjetivo: Number(goal),
            montoActual: 0,
            interes: interestBps / 100,
            duracionMeses: Math.max(1, Math.round(days / 30)),
            garantia: Number(goal) * 0.05,
            imagenURL: imageUrl || null,
            contractAddress: result.projectAddress,
            estado: "Funding",
            emprendedorId: user?.id ?? 1,
          }),
        });
      } catch {
        /* backend opcional */
      }

      await loadProjects();
      await refreshBalance(account);
      setActiveView("dashboard");
      alert("✅ Proyecto creado on-chain y garantía depositada");
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + (error.shortMessage || error.reason || error.message));
    } finally {
      setTxPending(false);
    }
  }

  const invest = (contractAddress, amount) => {
    const value = Number(amount);
    if (!value || value <= 0) return alert("Ingrese un monto válido");
    return runTx(() => investOnChain(contractAddress, value), "✅ Inversión realizada");
  };

  const vote = (contractAddress, milestoneId, support) =>
    runTx(() => voteOnChain(contractAddress, milestoneId, support),
      support ? "✅ Voto a favor registrado" : "✅ Voto en contra registrado");

  const finalizeFunding = (contractAddress) =>
    runTx(() => finalizeFundingOnChain(contractAddress), "✅ Funding finalizado, proyecto activo");

  const requestMilestone = (contractAddress, evidenceURI) =>
    runTx(() => requestMilestoneReleaseOnChain(contractAddress, evidenceURI), "✅ Votación de milestone iniciada");

  const finalizeVoting = (contractAddress, milestoneId) =>
    runTx(() => finalizeVotingOnChain(contractAddress, milestoneId), "✅ Votación finalizada");

  const makeRepayment = (contractAddress, index) =>
    runTx(() => makeRepaymentOnChain(contractAddress, index), "✅ Cuota pagada");

  const claimRewards = (contractAddress) =>
    runTx(() => claimRewardsOnChain(contractAddress), "✅ Recompensas reclamadas");

  const claimRefund = (contractAddress) =>
    runTx(() => claimRefundOnChain(contractAddress), "✅ Reembolso reclamado");

  // ─────────────── Navegación de proyectos ───────────────
  function openProject(project) {
    setSelectedId(project.contractAddress);
    setActiveView("detail");
  }

  // El proyecto seleccionado se deriva de la lista (siempre fresco).
  const selectedProject = projects.find((p) => p.contractAddress === selectedId) || null;

  // Filtrado por rol.
  const isCreator = user?.activeRole === "creator";
  const visibleProjects = isCreator
    ? projects.filter((p) => account && p.creator?.toLowerCase() === account.toLowerCase())
    : projects;

  return (
    <AppContext.Provider
      value={{
        account,
        usdcBalance,
        walletLoading,
        txPending,
        user,
        authError,
        loginOpen,
        activeView,
        projects,
        projectsLoading,
        visibleProjects,
        selectedProject,
        kycVerified,
        kycModalOpen,
        setActiveView,
        openLogin,
        closeLogin,
        login,
        logout,
        openKycModal,
        closeKycModal,
        approveKyc,
        startCreateProject,
        connectWallet,
        disconnectWallet,
        requestFaucet,
        loadProjects,
        createProject,
        invest,
        vote,
        finalizeFunding,
        requestMilestone,
        finalizeVoting,
        makeRepayment,
        claimRewards,
        claimRefund,
        openProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
