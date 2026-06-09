import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { Agendamento } from "@/domain/entities/Agendamento";

export class AtualizarStatusAgendamento {
  constructor(private agendamentoRepo: IAgendamentoRepository) {}

  async execute(
    token: string,
    id: number,
    status: "PENDENTE" | "CONFIRMADO" | "CANCELADO"
  ): Promise<Agendamento> {
    return await this.agendamentoRepo.atualizarStatus(token, id, status);
  }
}
