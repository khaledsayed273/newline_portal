/**
 * Compatibility adapter for the pre-modular repository implementation.
 *
 * New module repositories import through this boundary. Query bodies remain in
 * server/db.ts for now so this refactor does not change query behavior.
 */
export * from "../db";
