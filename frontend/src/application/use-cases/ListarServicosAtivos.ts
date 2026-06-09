import { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import { Servico } from "@/domain/entities/Servico";

export class ListarServicosAtivos {
  constructor(private servicoRepo: IServicoRepository) {}

  async execute(): Promise<Servico[]> {
    return await this.servicoRepo.listarAtivos();
  }
}
