import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { Agendamento } from "@/domain/entities/Agendamento";
import { Telefone } from "@/domain/value-objects/Telefone";

interface CriarAgendamentoAdminInput {
  token: string;
  servicoId: number;
  dataHoraInicio: Date;
  nomeCliente: string;
  telefoneClienteRaw: string;
}

export class CriarAgendamentoAdmin {
  constructor(private agendamentoRepo: IAgendamentoRepository) {}

  async execute(input: CriarAgendamentoAdminInput): Promise<Agendamento> {
    const telefone = new Telefone(input.telefoneClienteRaw);
    return await this.agendamentoRepo.criarAdmin(input.token, {
      servicoId: input.servicoId,
      dataHoraInicio: input.dataHoraInicio,
      nomeCliente: input.nomeCliente,
      telefoneCliente: telefone.valor,
    });
  }
}
