import { IAgendamentoRepository } from "../../domain/repositories/IAgendamentoRepository";
import { Agendamento } from "../../domain/entities/Agendamento";
import { Telefone } from "../../domain/value-objects/Telefone";
import { HttpClient } from "../http/HttpClient";

export class HttpAgendamentoRepository implements IAgendamentoRepository {
  constructor(private http: HttpClient) {}

  async listarSlotsDisponiveis(data: string, servicoId: number): Promise<{ hora: string }[]> {
    const body = await this.http.request<{ slots: { hora: string }[] }>(
      `/api/agendamentos/disponiveis?data=${data}&servico_id=${servicoId}`
    );
    return body.slots;
  }

  private mapToEntity(a: any): Agendamento {
    const dateStr = a.data_hora_inicio.endsWith("Z")
      ? a.data_hora_inicio
      : `${a.data_hora_inicio}Z`;
    return new Agendamento(
      {
        servicoId: a.servico_id,
        dataHoraInicio: new Date(dateStr),
        nomeCliente: a.nome_cliente,
        telefoneCliente: new Telefone(a.telefone_cliente),
        status: a.status,
        slotSize: a.slot_size,
      },
      a.id,
      a.criado_em ? new Date(a.criado_em) : undefined
    );
  }

  private toLocalISO(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().substring(0, 19);
  }

  async criar(payload: {
    servicoId: number;
    dataHoraInicio: Date;
    nomeCliente: string;
    telefoneCliente: string;
  }): Promise<Agendamento> {
    const data = await this.http.request<any>("/api/agendamentos", {
      method: "POST",
      body: {
        servico_id: payload.servicoId,
        data_hora_inicio: this.toLocalISO(payload.dataHoraInicio),
        nome_cliente: payload.nomeCliente,
        telefone_cliente: payload.telefoneCliente,
      },
    });
    return this.mapToEntity(data);
  }

  async criarAdmin(
    token: string,
    payload: {
      servicoId: number;
      dataHoraInicio: Date;
      nomeCliente: string;
      telefoneCliente: string;
    }
  ): Promise<Agendamento> {
    const data = await this.http.request<any>("/api/admin/agendamentos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        servico_id: payload.servicoId,
        data_hora_inicio: this.toLocalISO(payload.dataHoraInicio),
        nome_cliente: payload.nomeCliente,
        telefone_cliente: payload.telefoneCliente,
      },
    });
    return this.mapToEntity(data);
  }

  async listarAdmin(token: string, data: string): Promise<Agendamento[]> {
    const list = await this.http.request<any[]>(`/api/admin/agendamentos?data=${data}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return list.map((a: any) => this.mapToEntity(a));
  }

  async atualizarStatus(
    token: string,
    id: number,
    status: "PENDENTE" | "CONFIRMADO" | "CANCELADO"
  ): Promise<Agendamento> {
    const data = await this.http.request<any>(`/api/admin/agendamentos/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { status },
    });
    return this.mapToEntity(data);
  }
}
