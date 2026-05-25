import { useApp } from "../context/AppContext";

export function useProject() {
  const { selectedProject, invest, vote, votes } = useApp();

  return {
    project: selectedProject,
    invest,
    vote,
    votes,
  };
}
