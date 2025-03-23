import { getStorageDisplayName } from "../storage";

describe("storage utility", () => {
  describe("getStorageDisplayName", () => {
    it("returns 'PostgreSQL' when given 'postgres' storage type", () => {
      expect(getStorageDisplayName("postgres")).toBe("PostgreSQL");
    });

    it("returns 'Local Storage' when given 'local' storage type", () => {
      expect(getStorageDisplayName("local")).toBe("Local Storage");
    });

    it("handles unknown storage types gracefully", () => {
      // @ts-expect-error Testing with invalid type
      expect(getStorageDisplayName("unknown")).toBe("Local Storage");
    });
  });
});
