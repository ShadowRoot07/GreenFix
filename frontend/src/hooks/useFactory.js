import { useApp } from "../context/AppContext";

export function useFactory() {
  const { visibleProjects, createProject, projectsLoading, loadProjects } = useApp();

  return {
    projects: visibleProjects,
    createProject,
    projectsLoading,
    loadProjects,
  };
}
