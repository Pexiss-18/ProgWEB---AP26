import { Entity } from "./Entity";
import { Telefone } from "../value-objects/Telefone";
import { TransicaoStatusInvalidaError, AgendamentoPassadoError } from "../errors/DomainErrors";

interface AgendamentoProps {
  servicoId: number;
  dataHoraInicio: Date;
  nomeCliente: string;
  telefoneCliente: Telefone;
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
  slotSize: number;
}

export class Agendamento extends Entity<AgendamentoProps> {
  constructor(props: AgendamentoProps, id?: number, criadoEm?: Date) {
    super(props, id, criadoEm);
  }

  get servicoId(): number {
    return this.props.servicoId;
  }

  get dataHoraInicio(): Date {
    return this.props.dataHoraInicio;
  }

  get nomeCliente(): string {
    return this.props.nomeCliente;
  }

  get telefoneCliente(): Telefone {
    return this.props.telefoneCliente;
  }

  get status(): "PENDENTE" | "CONFIRMADO" | "CANCELADO" {
    return this.props.status;
  }

  get slotSize(): number {
    return this.props.slotSize;
  }

  get duracaoMinutos(): number {
    return this.props.slotSize * 30;
  }

  get horaFim(): Date {
    const fim = new Date(this.props.dataHoraInicio.getTime());
    fim.setMinutes(fim.getMinutes() + this.duracaoMinutos);
    return fim;
  }

  estaCancelado(): boolean {
    return this.props.status === "CANCELADO";
  }

  estaConfirmado(): boolean {
    return this.props.status === "CONFIRMADO";
  }

  confirmar(): void {
    if (this.props.status !== "PENDENTE") {
      throw new TransicaoStatusInvalidaError(
        `Não é possível confirmar um agendamento com status '${this.props.status}'.`
      );
    }
    this.props.status = "CONFIRMADO";
  }

  cancelar(): void {
    if (this.estaCancelado()) {
      throw new TransicaoStatusInvalidaError("Este agendamento já está cancelado.");
    }
    const agora = new Date();
    if (this.props.dataHoraInicio.getTime() < agora.getTime()) {
      throw new AgendamentoPassadoError("Não é possível cancelar um agendamento que já passou.");
    }
    this.props.status = "CANCELADO";
  }

  colideCom(outro: Agendamento): boolean {
    if (this.estaCancelado() || outro.estaCancelado()) {
      return false;
    }
    const aInicio = this.props.dataHoraInicio.getTime();
    const aFim = this.horaFim.getTime();
    const bInicio = outro.props.dataHoraInicio.getTime();
    const bFim = outro.horaFim.getTime();

    return aInicio < bFim && aFim > bInicio;
  }
}
