import { describe, it, expect } from "vitest";
import { Agendamento } from "@/domain/entities/Agendamento";
import { Telefone } from "@/domain/value-objects/Telefone";
import { TransicaoStatusInvalidaError, AgendamentoPassadoError } from "@/domain/errors/DomainErrors";

describe("Agendamento Entity", () => {
  it("deve criar um agendamento válido e calcular horaFim", () => {
    const dataInicio = new Date("2026-05-26T10:00:00Z");
    const agendamento = new Agendamento(
      {
        servicoId: 1,
        dataHoraInicio: dataInicio,
        nomeCliente: "Marlon",
        telefoneCliente: new Telefone("5511999999999"),
        status: "PENDENTE",
        slotSize: 2, // 60 minutos
      },
      1
    );

    expect(agendamento.horaFim.toISOString()).toBe("2026-05-26T11:00:00.000Z");
    expect(agendamento.estaConfirmado()).toBe(false);
    expect(agendamento.estaCancelado()).toBe(false);
  });

  it("deve confirmar um agendamento pendente com sucesso", () => {
    const agendamento = new Agendamento({
      servicoId: 1,
      dataHoraInicio: new Date("2026-05-26T10:00:00Z"),
      nomeCliente: "Marlon",
      telefoneCliente: new Telefone("5511999999999"),
      status: "PENDENTE",
      slotSize: 1,
    });

    agendamento.confirmar();
    expect(agendamento.estaConfirmado()).toBe(true);
    expect(agendamento.status).toBe("CONFIRMADO");
  });

  it("deve falhar ao confirmar um agendamento já cancelado ou confirmado", () => {
    const agendamento = new Agendamento({
      servicoId: 1,
      dataHoraInicio: new Date("2026-05-26T10:00:00Z"),
      nomeCliente: "Marlon",
      telefoneCliente: new Telefone("5511999999999"),
      status: "CANCELADO",
      slotSize: 1,
    });

    expect(() => agendamento.confirmar()).toThrow(TransicaoStatusInvalidaError);
  });

  it("deve falhar ao cancelar um agendamento do passado", () => {
    const dataPassada = new Date();
    dataPassada.setHours(dataPassada.getHours() - 2);

    const agendamento = new Agendamento({
      servicoId: 1,
      dataHoraInicio: dataPassada,
      nomeCliente: "Marlon",
      telefoneCliente: new Telefone("5511999999999"),
      status: "PENDENTE",
      slotSize: 1,
    });

    expect(() => agendamento.cancelar()).toThrow(AgendamentoPassadoError);
  });

  it("deve colidir corretamente com agendamentos concorrentes", () => {
    const a1 = new Agendamento({
      servicoId: 1,
      dataHoraInicio: new Date("2026-05-26T10:00:00Z"),
      nomeCliente: "Cliente 1",
      telefoneCliente: new Telefone("5511999999999"),
      status: "CONFIRMADO",
      slotSize: 2, // 10:00 - 11:00
    });

    const a2 = new Agendamento({
      servicoId: 1,
      dataHoraInicio: new Date("2026-05-26T10:30:00Z"),
      nomeCliente: "Cliente 2",
      telefoneCliente: new Telefone("5511999999999"),
      status: "CONFIRMADO",
      slotSize: 1, // 10:30 - 11:00
    });

    const a3 = new Agendamento({
      servicoId: 1,
      dataHoraInicio: new Date("2026-05-26T11:00:00Z"),
      nomeCliente: "Cliente 3",
      telefoneCliente: new Telefone("5511999999999"),
      status: "CONFIRMADO",
      slotSize: 1, // 11:00 - 11:30
    });

    expect(a1.colideCom(a2)).toBe(true);
    expect(a1.colideCom(a3)).toBe(false); // Colar na extremidade não é colisão
  });
});
