import { IServicoRepository } from "../../domain/repositories/IServicoRepository";
import { Servico } from "../../domain/entities/Servico";
import { Preco } from "../../domain/value-objects/Preco";
import { HttpClient } from "../http/HttpClient";

export class HttpServicoRepository implements IServicoRepository {
  constructor(private http: HttpClient) {}

  async listarAtivos(): Promise<Servico[]> {
    const data = await this.http.request<any[]>("/api/servicos");
    return data.map(
      (s: any) =>
        new Servico(
          {
            nome: s.nome,
            preco: new Preco(s.preco),
            slotSize: s.slot_size,
            ativo: s.ativo,
          },
          s.id,
          s.criado_em ? new Date(s.criado_em) : undefined
        )
    );
  }

  async buscarPorId(id: number): Promise<Servico | null> {
    const ativos = await this.listarAtivos();
    return ativos.find((s) => s.id === id) ?? null;
  }
}
