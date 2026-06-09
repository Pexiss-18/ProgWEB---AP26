import { describe, it, expect } from "vitest";

describe("Teste trivial", () => {
    it("deve validar que o Vitest está funcionando", () => {
        expect(true).toBe(true);
    });

    it("deve somar corretamente", () => {
        expect(1 + 1).toBe(2);
    });
});
