import { describe, it, expect } from "vitest";
import { Servico } from "@/domain/entities/Servico";
import { Preco } from "@/domain/value-objects/Preco";
import { ValorInvalidoError } from "@/domain/errors/DomainErrors";

describe("Servico Entity", () => {
  it("deve criar um serviço válido", () => {
    const servico = new Servico(
      {
        nome: "Cabelo",
        preco: new Preco(40),
        slotSize: 1,
        ativo: true,
      },
      1
    );

    expect(servico.id).toBe(1);
    expect(servico.nome).toBe("Cabelo");
    expect(servico.preco.valor).toBe(40);
    expect(servico.slotSize).toBe(1);
    expect(servico.duracaoMinutos).toBe(30);
  });

  it("deve lançar erro se o slotSize não for 1 ou 2", () => {
    expect(() =>
      new Servico({
        nome: "Invalido",
        preco: new Preco(40),
        slotSize: 3,
        ativo: true,
      })
    ).toThrow(ValorInvalidoError);
  });
});
