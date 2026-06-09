import { Agendamento } from "../entities/Agendamento";

export interface IAgendamentoRepository {
  listarSlotsDisponiveis(data: string, servicoId: number): Promise<{ hora: string }[]>;
  criar(payload: {
    servicoId: number;
    dataHoraInicio: Date;
    nomeCliente: string;
    telefoneCliente: string;
  }): Promise<Agendamento>;
  criarAdmin(
    token: string,
    payload: {
      servicoId: number;
      dataHoraInicio: Date;
      nomeCliente: string;
      telefoneCliente: string;
    }
  ): Promise<Agendamento>;
  listarAdmin(token: string, data: string): Promise<Agendamento[]>;
  atualizarStatus(
    token: string,
    id: number,
    status: "PENDENTE" | "CONFIRMADO" | "CANCELADO"
  ): Promise<Agendamento>;
}
