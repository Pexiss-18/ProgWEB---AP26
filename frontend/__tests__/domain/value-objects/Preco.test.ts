import { describe, it, expect } from "vitest";
import { Preco } from "@/domain/value-objects/Preco";
import { ValorInvalidoError } from "@/domain/errors/DomainErrors";

describe("Preco Value Object", () => {
  it("deve criar um preço válido com valor positivo", () => {
    const preco = new Preco(150);
    expect(preco.valor).toBe(150);
  });

  it("deve lançar erro se o preço for menor ou igual a zero", () => {
    expect(() => new Preco(0)).toThrow(ValorInvalidoError);
    expect(() => new Preco(-10)).toThrow(ValorInvalidoError);
  });

  it("deve formatar corretamente para BRL", () => {
    const preco = new Preco(50.5);
    const formatado = preco.formatado.replace(/\s/g, " ");
    expect(formatado).toMatch(/R\$\s50,50/);
  });
});
