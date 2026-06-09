import { describe, it, expect, vi } from "vitest";
import { CriarAgendamento } from "@/application/use-cases/CriarAgendamento";
import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { ValidationError } from "@/domain/errors/DomainErrors";
import { Agendamento } from "@/domain/entities/Agendamento";
import { Telefone } from "@/domain/value-objects/Telefone";

describe("CriarAgendamento Use Case", () => {
  it("deve criar o agendamento com sucesso se o telefone for válido", async () => {
    const mockAgendamento = new Agendamento(
      {
        servicoId: 1,
        dataHoraInicio: new Date("2026-05-26T10:00:00Z"),
        nomeCliente: "Marlon",
        telefoneCliente: new Telefone("5511999999999"),
        status: "PENDENTE",
        slotSize: 1,
      },
      1
    );

    const mockAgendamentoRepo = {
      criar: vi.fn().mockResolvedValue(mockAgendamento),
    } as unknown as IAgendamentoRepository;

    const useCase = new CriarAgendamento(mockAgendamentoRepo);
    const result = await useCase.execute({
      servicoId: 1,
      dataHoraInicio: new Date("2026-05-26T10:00:00Z"),
      nomeCliente: "Marlon",
      telefoneClienteRaw: "+55 (11) 99999-9999",
    });

    expect(mockAgendamentoRepo.criar).toHaveBeenCalledWith({
      servicoId: 1,
      dataHoraInicio: expect.any(Date),
      nomeCliente: "Marlon",
      telefoneCliente: "5511999999999",
    });
    expect(result.id).toBe(1);
    expect(result.nomeCliente).toBe("Marlon");
  });

  it("deve rejeitar e lançar erro se o telefone do cliente for inválido", async () => {
    const mockAgendamentoRepo = {
      criar: vi.fn(),
    } as unknown as IAgendamentoRepository;

    const useCase = new CriarAgendamento(mockAgendamentoRepo);

    await expect(
      useCase.execute({
        servicoId: 1,
        dataHoraInicio: new Date("2026-05-26T10:00:00Z"),
        nomeCliente: "Marlon",
        telefoneClienteRaw: "12345",
      })
    ).rejects.toThrow(ValidationError);

    expect(mockAgendamentoRepo.criar).not.toHaveBeenCalled();
  });
});
