/**
 * @interface Group
 * Representa um grupo de despesas compartilhadas.
 * Contém informações sobre os membros e metadados do grupo.
 */
export interface Group {
    /**
     * Identificador único do grupo.
     */
    id: string;

    /**
     * Nome do grupo.
     */
    name: string;

    /**
     * Descrição detalhada do grupo.
     * @optional
     */
    description?: string;

    /**
     * ID do usuário que criou o grupo.
     * // User ID
     */
    createdBy: string;

    /**
     * Lista de IDs dos usuários que são membros do grupo.
     * // Array de IDs de Usuários
     */
    members: string[];

    /**
     * Data de criação do grupo.
     */
    createdAt: Date;

    /**
     * URL da foto do grupo.
     * @optional
     * // Foto do grupo opcional
     */
    photoUrl?: string;
}
