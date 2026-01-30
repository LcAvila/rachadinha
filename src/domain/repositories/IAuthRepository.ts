import { User } from '../entities/User';

/**
 * @interface IAuthRepository
 * Interface que define os métodos para operações de autenticação e gestão de usuários.
 */
export interface IAuthRepository {
    /**
     * Realiza o login do usuário.
     * @param email Email do usuário.
     * @param password Senha do usuário.
     * @returns Uma promessa que resolve com o objeto User autenticado.
     */
    login(email: string, password: string): Promise<User>;

    /**
     * Registra um novo usuário no sistema.
     * @param email Email do novo usuário.
     * @param password Senha do novo usuário.
     * @param name Nome completo.
     * @param username Nome de usuário (opcional).
     * @returns Uma promessa que resolve com o objeto User criado.
     */
    register(email: string, password: string, name: string, username?: string): Promise<User>;

    /**
     * Verifica se um nome de usuário já está em uso.
     * @param username Nome de usuário a verificar.
     * @returns Uma promessa que resolve com true se disponível, false se indisponível.
     */
    checkUsernameAvailability(username: string): Promise<boolean>;

    /**
     * Atualiza os dados do perfil do usuário.
     * @param userId ID do usuário.
     * @param data Objeto parcial com os dados a serem atualizados.
     * @returns Uma promessa vazia.
     */
    updateProfile(userId: string, data: Partial<User>): Promise<void>;

    /**
     * Faz o upload da foto de perfil do usuário.
     * @param userId ID do usuário.
     * @param imageUri URI local da imagem.
     * @returns Uma promessa com a URL da imagem hospedada.
     */
    uploadProfilePhoto(userId: string, imageUri: string): Promise<string>;

    /**
     * Altera a senha do usuário atual.
     * @param newPassword Nova senha.
     * @returns Uma promessa vazia.
     */
    changePassword(newPassword: string): Promise<void>;

    /**
     * Realiza o logout do usuário.
     * @returns Uma promessa vazia.
     */
    logout(): Promise<void>;

    /**
     * Obtém o usuário atualmente autenticado.
     * @returns Uma promessa que resolve com o User ou null se não houver sessão.
     */
    getCurrentUser(): Promise<User | null>;

    /**
     * Atualiza o token de push notification do usuário.
     * @param userId ID do usuário.
     * @param pushToken Novo token de push.
     * @returns Uma promessa vazia.
     */
    updatePushToken(userId: string, pushToken: string): Promise<void>;
}
