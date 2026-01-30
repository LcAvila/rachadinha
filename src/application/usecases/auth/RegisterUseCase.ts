import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { User } from '../../../domain/entities/User';

/**
 * @class RegisterUseCase
 * Caso de uso responsável por registrar novos usuários no sistema.
 */
export class RegisterUseCase {
    /**
     * Construtor do RegisterUseCase.
     * @param authRepository Repositório de autenticação.
     */
    constructor(private authRepository: IAuthRepository) { }

    /**
     * Executa a lógica de registro de usuário.
     * @param email Email do usuário.
     * @param password Senha do usuário.
     * @param name Nome completo do usuário.
     * @param username Nome de usuário (opcional).
     * @returns Uma promessa que resolve com o usuário recém-criado.
     */
    async execute(email: string, password: string, name: string, username?: string): Promise<User> {
        // Delega a criação do usuário para o repositório
        return this.authRepository.register(email, password, name, username);
    }
}
