import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { Agendamento } from "@/domain/entities/Agendamento";
import { Telefone } from "@/domain/value-objects/Telefone";

interface CriarAgendamentoInput {
  servicoId: number;
  dataHoraInicio: Date;
  nomeCliente: string;
  telefoneClienteRaw: string;
}

export class CriarAgendamento {
  constructor(private agendamentoRepo: IAgendamentoRepository) {}

  async execute(input: CriarAgendamentoInput): Promise<Agendamento> {
    const telefone = new Telefone(input.telefoneClienteRaw);
    return await this.agendamentoRepo.criar({
      servicoId: input.servicoId,
      dataHoraInicio: input.dataHoraInicio,
      nomeCliente: input.nomeCliente,
      telefoneCliente: telefone.valor,
    });
  }
}
