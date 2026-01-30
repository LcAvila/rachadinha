import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { User } from '../../../domain/entities/User';

/**
 * @class LoginUseCase
 * Caso de uso responsável por realizar o login do usuário.
 */
export class LoginUseCase {
    /**
     * Construtor do LoginUseCase.
     * @param authRepository Repositório de autenticação.
     */
    constructor(private authRepository: IAuthRepository) { }

    /**
     * Executa a lógica de login.
     * @param identifier Email ou nome de usuário.
     * @param password Senha do usuário.
     * @returns Uma promessa que resolve com o usuário autenticado.
     */
    async execute(identifier: string, password: string): Promise<User> {
        // Delega a operação de login para o repositório
        return this.authRepository.login(identifier, password);
    }
}
