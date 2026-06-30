process.env.TZ = "America/Sao_Paulo";

import { describe, it, expect, vi, afterEach } from "vitest";
import { HttpClient } from "@/infrastructure/http/HttpClient";
import { HttpAgendamentoRepository } from "@/infrastructure/repositories/HttpAgendamentoRepository";

describe("HttpAgendamentoRepository.listarSlotsDisponiveis", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converte datetimes ISO em UTC do backend para HH:mm no horário de Brasília", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        // 12:00Z / 12:30Z = 09:00 / 09:30 em America/Sao_Paulo (UTC-3)
        json: async () => ({
          slots: ["2026-07-01T12:00:00Z", "2026-07-01T12:30:00Z"],
        }),
      })
    );

    const repo = new HttpAgendamentoRepository(new HttpClient("http://test"));
    const slots = await repo.listarSlotsDisponiveis("2026-07-01", 1);

    expect(slots).toEqual([{ hora: "09:00" }, { hora: "09:30" }]);
  });
});
