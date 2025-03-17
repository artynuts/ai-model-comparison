import { StorageType } from "../storage/StorageProvider";

export function getStorageDisplayName(storageType: StorageType): string {
  return storageType === "postgres" ? "PostgreSQL" : "Local Storage";
}
