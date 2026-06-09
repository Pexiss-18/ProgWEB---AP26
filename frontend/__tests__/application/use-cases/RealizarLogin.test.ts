import { describe, it, expect, vi } from "vitest";
import { RealizarLogin } from "@/application/use-cases/RealizarLogin";
import { IAdminRepository } from "@/domain/repositories/IAdminRepository";
import { ValidationError } from "@/domain/errors/DomainErrors";

describe("RealizarLogin Use Case", () => {
  it("deve autenticar o admin e retornar o token quando credenciais são válidas", async () => {
    const mockAdminRepo = {
      login: vi.fn().mockResolvedValue("mocked-token-jwt"),
    } as unknown as IAdminRepository;

    const useCase = new RealizarLogin(mockAdminRepo);
    const token = await useCase.execute("admin@barbearia.com", "senha123");

    expect(mockAdminRepo.login).toHaveBeenCalledWith("admin@barbearia.com", "senha123");
    expect(token).toBe("mocked-token-jwt");
  });

  it("deve lançar erro se o e-mail fornecido for inválido", async () => {
    const mockAdminRepo = {
      login: vi.fn(),
    } as unknown as IAdminRepository;

    const useCase = new RealizarLogin(mockAdminRepo);

    await expect(useCase.execute("email-invalido", "senha123")).rejects.toThrow(ValidationError);
    expect(mockAdminRepo.login).not.toHaveBeenCalled();
  });
});
