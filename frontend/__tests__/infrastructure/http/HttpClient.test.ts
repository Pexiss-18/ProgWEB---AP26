import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpClient } from "@/infrastructure/http/HttpClient";
import {
  ValorInvalidoError,
  TransicaoStatusInvalidaError,
  ValidationError,
  AgendamentoPassadoError,
  ServicoInativoError,
  SlotIndisponivelError,
  ServicoComAgendamentosFuturosError,
  DomainError,
} from "@/domain/errors/DomainErrors";

describe("HttpClient Error Mapping Tests", () => {
  let client: HttpClient;

  beforeEach(() => {
    client = new HttpClient("http://localhost:8000");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve retornar dados de sucesso", async () => {
    const mockData = { id: 1, nome: "Teste" };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await client.request("/api/test");
    expect(result).toEqual(mockData);
  });

  it("deve mapear erro de serviço inativo para ServicoInativoError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "O serviço 'Corte' está inativo e não pode ser agendado." }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(ServicoInativoError);
  });

  it("deve mapear erro de agendamento no passado para AgendamentoPassadoError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Não é possível cancelar um agendamento que já passou." }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(AgendamentoPassadoError);
  });

  it("deve mapear erro de transição inválida de status para TransicaoStatusInvalidaError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Não é possível confirmar um agendamento com status 'CANCELADO'." }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(TransicaoStatusInvalidaError);
  });

  it("deve mapear erro de valor inválido para ValorInvalidoError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Preço deve ser positivo. Recebido: -10" }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(ValorInvalidoError);
  });

  it("deve mapear erro de slot indisponível para SlotIndisponivelError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "Este horário acabou de ser reservado. Escolha outro." }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(SlotIndisponivelError);
  });

  it("deve mapear erro de serviço com agendamentos futuros para ServicoComAgendamentosFuturosError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ detail: "O serviço possui agendamentos futuros." }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(ServicoComAgendamentosFuturosError);
  });

  it("deve mapear erro de validação (FastAPI array) para ValidationError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [
          { loc: ["body", "telefone_cliente"], msg: "field required", type: "value_error.missing" }
        ]
      }),
    });

    await expect(client.request("/api/test")).rejects.toThrow(ValidationError);
  });

  it("deve mapear erro genérico de cliente (400) sem texto específico para DomainError", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => { throw new Error(); },
    });

    await expect(client.request("/api/test")).rejects.toThrow(DomainError);
  });
});
