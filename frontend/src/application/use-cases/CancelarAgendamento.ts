import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { Agendamento } from "@/domain/entities/Agendamento";
import { Telefone } from "@/domain/value-objects/Telefone";

interface CancelarAgendamentoInput {
  id: number;
  telefoneClienteRaw: string;
}

export class CancelarAgendamento {
  constructor(private agendamentoRepo: IAgendamentoRepository) {}

  async execute(input: CancelarAgendamentoInput): Promise<Agendamento> {
    const telefone = new Telefone(input.telefoneClienteRaw);
    return await this.agendamentoRepo.cancelar(input.id, telefone.valor);
  }
}
