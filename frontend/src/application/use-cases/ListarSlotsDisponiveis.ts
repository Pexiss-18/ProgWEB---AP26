import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";

export class ListarSlotsDisponiveis {
  constructor(private agendamentoRepo: IAgendamentoRepository) {}

  async execute(data: string, servicoId: number): Promise<{ hora: string }[]> {
    return await this.agendamentoRepo.listarSlotsDisponiveis(data, servicoId);
  }
}
