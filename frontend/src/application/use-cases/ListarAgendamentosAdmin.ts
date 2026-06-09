import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { Agendamento } from "@/domain/entities/Agendamento";

export class ListarAgendamentosAdmin {
  constructor(private agendamentoRepo: IAgendamentoRepository) {}

  async execute(token: string, data: string): Promise<Agendamento[]> {
    return await this.agendamentoRepo.listarAdmin(token, data);
  }
}
