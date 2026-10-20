import * as repository from "./repository";

export const getAll = (input: any) =>
  repository.getLibraryResources(
    input.category,
    input.source,
    input.search,
    input.page,
    input.limit
  );
export const getCategories = () => repository.getLibraryCategories();
export const getSources = () => repository.getLibrarySources();
export const getStats = () => repository.getLibraryStats();
