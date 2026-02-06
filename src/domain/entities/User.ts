/**
 * @interface User
 * Representa um usuário no sistema.
 * Contém informações pessoais e configurações da conta.
 */
export interface User {
    /**
     * Identificador único do usuário.
     */
    id: string;

    /**
     * Nome completo do usuário.
     */
    name: string;

    /**
     * Endereço de e-mail do usuário.
     */
    email: string;

    /**
     * Nome de usuário único (handle).
     * @optional
     * // Opcional por enquanto, será obrigatório para novos usuários
     */
    username?: string;

    /**
     * Apelido do usuário para exibição.
     * @optional
     */
    nickname?: string;

    /**
     * Biografia ou descrição curta do usuário.
     * @optional
     */
    bio?: string;

    /**
     * URL da foto de perfil do usuário.
     * @optional
     */
    photoUrl?: string;

    /**
     * Token para envio de notificações push.
     * @optional
     */
    pushToken?: string;

    /**
     * Telefone de contato do usuário.
     * @optional
     */
    phone?: string;

    /**
     * Chave PIX para recebimento de pagamentos.
     * @optional
     */
    pixKey?: string;

    /**
     * Data de nascimento do usuário.
     * @optional
     */
    birthDate?: string;

    /**
     * Localização ou cidade do usuário.
     * @optional
     */
    location?: string;

    /**
     * Data de criação da conta do usuário.
     */
    createdAt: Date;
}
