import { describe, it, expect } from "vitest";
import { Telefone } from "@/domain/value-objects/Telefone";
import { ValidationError } from "@/domain/errors/DomainErrors";

describe("Telefone Value Object", () => {
  it("deve criar um telefone válido com código do país 55", () => {
    const telefone = new Telefone("5511999999999");
    expect(telefone.valor).toBe("5511999999999");
  });

  it("deve limpar caracteres não numéricos durante criação", () => {
    const telefone = new Telefone("+55 (11) 99999-9999");
    expect(telefone.valor).toBe("5511999999999");
  });

  it("deve lançar erro se o telefone não iniciar com 55", () => {
    expect(() => new Telefone("11999999999")).toThrow(ValidationError);
  });

  it("deve lançar erro se o telefone tiver comprimento incorreto", () => {
    expect(() => new Telefone("55119999")).toThrow(ValidationError);
    expect(() => new Telefone("551199999999999")).toThrow(ValidationError);
  });

  it("deve formatar corretamente para exibição", () => {
    const t9 = new Telefone("5511999999999");
    expect(t9.formatado).toBe("+55 (11) 99999-9999");

    const t8 = new Telefone("551188888888");
    expect(t8.formatado).toBe("+55 (11) 8888-8888");
  });
});
