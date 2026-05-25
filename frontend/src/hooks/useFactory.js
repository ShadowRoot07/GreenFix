import { useApp } from "../context/AppContext";

export function useFactory() {
  const { creatorProjects, createProject, deleteCreatorProject } = useApp();

  return {
    creatorProjects,
    createProject,
    deleteCreatorProject,
  };
}
