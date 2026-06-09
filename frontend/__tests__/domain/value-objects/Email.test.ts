import { describe, it, expect } from "vitest";
import { Email } from "@/domain/value-objects/Email";
import { ValidationError } from "@/domain/errors/DomainErrors";

describe("Email Value Object", () => {
  it("deve criar um e-mail válido com formato correto", () => {
    const email = new Email("teste@barbearia.com");
    expect(email.valor).toBe("teste@barbearia.com");
  });

  it("deve normalizar o e-mail em minúsculas e sem espaços", () => {
    const email = new Email("  TESTE@barbearia.COM  ");
    expect(email.valor).toBe("teste@barbearia.com");
  });

  it("deve lançar erro ao tentar criar com formato inválido", () => {
    expect(() => new Email("invalido")).toThrow(ValidationError);
    expect(() => new Email("invalido@com")).toThrow(ValidationError);
  });
});
