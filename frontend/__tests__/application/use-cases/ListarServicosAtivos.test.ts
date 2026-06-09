import { describe, it, expect, vi } from "vitest";
import { ListarServicosAtivos } from "@/application/use-cases/ListarServicosAtivos";
import { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import { Servico } from "@/domain/entities/Servico";
import { Preco } from "@/domain/value-objects/Preco";

describe("ListarServicosAtivos Use Case", () => {
  it("deve retornar lista de serviços do repositório", async () => {
    const listMock = [
      new Servico(
        {
          nome: "Barba",
          preco: new Preco(30),
          slotSize: 1,
          ativo: true,
        },
        1
      ),
    ];

    const mockServicoRepo = {
      listarAtivos: vi.fn().mockResolvedValue(listMock),
    } as unknown as IServicoRepository;

    const useCase = new ListarServicosAtivos(mockServicoRepo);
    const result = await useCase.execute();

    expect(mockServicoRepo.listarAtivos).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe("Barba");
  });
});
