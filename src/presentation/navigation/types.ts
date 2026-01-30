import { Expense } from '../../domain/entities/Expense';

/**
 * @type RootStackParamList
 * Define a tipagem dos parâmetros para todas as rotas (telas) da aplicação.
 * Utilizado pelo React Navigation para garantir type-safety na navegação.
 */
export type RootStackParamList = {
    /**
     * Tela de Login (entrada do app).
     */
    Login: undefined;

    /**
     * Tela de Registro de Usuário.
     * @deprecated Parte do fluxo de login atualmente.
     */
    Register: undefined;

    /**
     * Tela de Listagem de Grupos.
     */
    Groups: undefined;

    /**
     * Tela de Criação de Grupo.
     */
    CreateGroup: undefined;

    /**
     * Navegador Principal em Abas (Home, Financeiro, etc).
     * @param screen Nome da tela interna inicial (opcional).
     * @param params Parâmetros para a tela interna (opcional).
     */
    Home: { screen: string; params?: any } | undefined;

    /**
     * Tela de Criação Inicial de Despesa (Título, Grupo, etc).
     */
    CreateExpense: undefined;

    /**
     * Tela de Adição de Itens à Despesa.
     * @param expenseId ID da despesa em criação.
     */
    AddItems: { expenseId: string };

    /**
     * Tela de Pagamentos Pendentes (Detalhes de dívidas/créditos).
     */
    PendingExpenses: undefined;

    /**
     * Tela de Perfil do Usuário.
     */
    Profile: undefined;

    /**
     * Tela de Notificações.
     */
    Notifications: undefined;
};
