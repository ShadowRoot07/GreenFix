import { useApp } from "../context/AppContext";

export function useProject() {
  const {
    selectedProject,
    invest,
    vote,
    finalizeFunding,
    requestMilestone,
    finalizeVoting,
    makeRepayment,
    claimRewards,
    claimRefund,
  } = useApp();

  return {
    project: selectedProject,
    invest,
    vote,
    finalizeFunding,
    requestMilestone,
    finalizeVoting,
    makeRepayment,
    claimRewards,
    claimRefund,
  };
}
