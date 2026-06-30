import { IAgendamentoRepository } from "../../domain/repositories/IAgendamentoRepository";
import { Agendamento } from "../../domain/entities/Agendamento";
import { Telefone } from "../../domain/value-objects/Telefone";
import { HttpClient } from "../http/HttpClient";

export class HttpAgendamentoRepository implements IAgendamentoRepository {
  constructor(private http: HttpClient) {}

  async listarSlotsDisponiveis(data: string, servicoId: number): Promise<{ hora: string }[]> {
    // Backend retorna uma lista simples de datetimes ISO em UTC (ex:
    // "2026-07-01T12:00:00Z" para as 09:00 de Brasília) — não objetos.
    // Convertemos para o horário local do navegador (assume-se Brasília)
    // para montar a grade de horários.
    const body = await this.http.request<{ slots: string[] }>(
      `/api/agendamentos/disponiveis?data=${data}&servico_id=${servicoId}`
    );
    return body.slots.map((iso) => {
      const d = new Date(this.comoUTC(iso));
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return { hora: `${hh}:${mm}` };
    });
  }

  // Garante que uma string ISO sem timezone seja interpretada como UTC,
  // sem duplicar o sufixo quando o backend já enviar um offset (ex: "+00:00").
  private comoUTC(isoStr: string): string {
    return /[zZ]|[+-]\d{2}:\d{2}$/.test(isoStr) ? isoStr : `${isoStr}Z`;
  }

  private mapToEntity(a: any): Agendamento {
    // Backend armazena telefone sem DDI (10-11 dígitos). Prefixamos "55" para
    // reconstruir o Telefone value object que exige o formato completo.
    return new Agendamento(
      {
        servicoId: a.servico_id,
        dataHoraInicio: new Date(this.comoUTC(a.data_hora_inicio)),
        nomeCliente: a.nome_cliente,
        telefoneCliente: new Telefone("55" + a.telefone_cliente),
        status: a.status,
        slotSize: a.slot_size,
      },
      a.id,
      a.criado_em ? new Date(this.comoUTC(a.criado_em)) : undefined
    );
  }

  // Remove o DDI "55" antes de enviar — o backend espera apenas DDD + número (10-11 dígitos).
  private stripDDI(telefone: string): string {
    return telefone.replace(/^55/, "");
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
        telefone_cliente: this.stripDDI(payload.telefoneCliente),
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
        telefone_cliente: this.stripDDI(payload.telefoneCliente),
      },
    });
    return this.mapToEntity(data);
  }

  async cancelar(id: number, telefoneCliente: string): Promise<Agendamento> {
    const data = await this.http.request<any>(`/api/agendamentos/${id}/cancelar`, {
      method: "PATCH",
      body: {
        telefone_cliente: this.stripDDI(telefoneCliente),
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
