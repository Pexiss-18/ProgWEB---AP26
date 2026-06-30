import { describe, it, expect, vi, afterEach } from "vitest";
import { HttpClient } from "@/infrastructure/http/HttpClient";
import { HttpAgendamentoRepository } from "@/infrastructure/repositories/HttpAgendamentoRepository";

describe("HttpAgendamentoRepository.listarSlotsDisponiveis", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converte a lista de datetimes ISO do backend em objetos { hora: 'HH:mm' }", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slots: ["2026-07-01T09:00:00Z", "2026-07-01T09:30:00Z"],
        }),
      })
    );

    const repo = new HttpAgendamentoRepository(new HttpClient("http://test"));
    const slots = await repo.listarSlotsDisponiveis("2026-07-01", 1);

    expect(slots).toEqual([{ hora: "09:00" }, { hora: "09:30" }]);
  });
});
