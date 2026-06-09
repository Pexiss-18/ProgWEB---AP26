import { Servico } from "../entities/Servico";

export interface IServicoRepository {
  listarAtivos(): Promise<Servico[]>;
  buscarPorId(id: number): Promise<Servico | null>;
}
