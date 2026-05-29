/**
 * Smoke test del flujo completo de GreenFix contra el nodo local.
 * Ejecuta: crear proyecto → garantía → invertir → finalizar funding →
 * milestone → votar → liberar fondos → repagar → completar → reclamar.
 *
 * Uso: npx hardhat run scripts/smoke.cjs --network localhost
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const USDC = (n) => BigInt(Math.round(n * 1e6)); // helper a 6 decimales
const fmt = (bn) => Number(bn) / 1e6;

async function main() {
  const { ethers } = hre;
  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "deployments.json"), "utf8")
  );
  const [creator, investor] = await ethers.getSigners();

  const usdc = await ethers.getContractAt("MockUSDC", deployment.contracts.MockUSDC);
  const factory = await ethers.getContractAt("GreenFixFactory", deployment.contracts.GreenFixFactory);

  console.log("\n🧪 SMOKE TEST GreenFix");
  console.log("Creator :", creator.address);
  console.log("Investor:", investor.address);

  // Aseguramos saldo USDC en ambas cuentas
  await (await usdc.mint(creator.address, USDC(1000))).wait();
  await (await usdc.mint(investor.address, USDC(1000))).wait();

  const goal = USDC(1000);
  const guarantee = (goal * 5n) / 100n; // 50 USDC

  // 1. Crear proyecto
  const txCreate = await factory.connect(creator).createProject(
    goal, 600, 30, 7 * 24 * 3600, "ipfs://demo-smoke"
  );
  const rc = await txCreate.wait();
  let projectAddress;
  for (const log of rc.logs) {
    try {
      const p = factory.interface.parseLog(log);
      if (p && p.name === "ProjectCreated") projectAddress = p.args[2];
    } catch {}
  }
  console.log("1. ✅ Proyecto creado:", projectAddress);
  const project = await ethers.getContractAt("GreenFixProject", projectAddress);

  // 2. Depositar garantía
  await (await usdc.connect(creator).approve(projectAddress, guarantee)).wait();
  await (await project.connect(creator).depositGuarantee()).wait();
  console.log("2. ✅ Garantía depositada:", fmt(guarantee), "USDC");

  // 3. Invertir el monto exacto
  await (await usdc.connect(investor).approve(projectAddress, goal)).wait();
  await (await project.connect(investor).invest(goal)).wait();
  console.log("3. ✅ Inversión:", fmt(goal), "USDC | totalRaised:", fmt(await project.totalRaised()));

  // 4. Finalizar funding
  await (await project.connect(creator).finalizeFunding()).wait();
  console.log("4. ✅ Funding finalizado | estado:", await project.state(), "| milestones:", Number(await project.getMilestoneCount()));

  // 5. Solicitar liberación de milestone + votar + finalizar
  await (await project.connect(creator).requestMilestoneRelease("ipfs://evidence-1")).wait();
  await (await project.connect(investor).vote(0, true)).wait();
  const creatorBalBefore = await usdc.balanceOf(creator.address);
  await (await project.connect(creator).finalizeVoting(0)).wait();
  const creatorBalAfter = await usdc.balanceOf(creator.address);
  console.log("5. ✅ Milestone 0 liberado | creador recibió:", fmt(creatorBalAfter - creatorBalBefore), "USDC | currentMilestone:", Number(await project.currentMilestone()));

  // 6. Pagar todas las cuotas
  const repaymentCount = Number(await project.getRepaymentCount());
  for (let i = 0; i < repaymentCount; i++) {
    const r = await project.repayments(i);
    await (await usdc.connect(creator).approve(projectAddress, r.amount)).wait();
    await (await project.connect(creator).makeRepayment(i)).wait();
  }
  console.log("6. ✅ Pagadas", repaymentCount, "cuotas | estado:", await project.state(), "(4 = Completed)");

  // 7. Reclamar recompensas
  const invBefore = await usdc.balanceOf(investor.address);
  await (await project.connect(investor).claimRewards()).wait();
  const invAfter = await usdc.balanceOf(investor.address);
  console.log("7. ✅ Inversor reclamó:", fmt(invAfter - invBefore), "USDC (capital + interés - fee)");

  console.log("\n🎉 FLUJO COMPLETO OK\n");
}

main().catch((e) => {
  console.error("❌ Smoke test falló:", e.shortMessage || e.message);
  process.exitCode = 1;
});
