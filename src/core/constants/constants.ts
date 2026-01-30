/**
 * @file constants.ts
 * Contém constantes globais utilizadas em todo o aplicativo Rachadinha.
 */

/**
 * Paleta de cores centralizada do aplicativo.
 * Baseada no design premium com tons de verde petróleo (Teal), dourado e tons de cinza.
 */
export const COLORS = {
    primary: '#20605D', // Verde Petróleo Profundo (usado em cabeçalhos)
    primaryDark: '#134E48', // Verde Petróleo mais escuro
    secondary: '#2DD4BF', // Teal Vibrante (detalhes e destaques)
    accent: '#F59E0B', // Dourado/Âmbar (cor da coroa do logo)
    background: '#F8F9FA', // Fundo off-white/cinza claro
    surface: '#FFFFFF', // Cor de fundo para cards e inputs (Pure white)
    surfaceLight: '#F3F4F6', // Cinza muito claro para fundos secundários
    text: '#1F2937', // Cinza escuro para texto principal
    textSecondary: '#6B7280', // Cinza médio para textos de apoio
    success: '#10B981', // Verde para estados de sucesso/pago
    error: '#EF4444', // Vermelho para erros e avisos críticos
    warning: '#F59E0B', // Âmbar para estados pendentes/atencão
    border: '#E5E7EB', // Cor padrão para bordas e divisores
    // Cores específicas de UI
    headerText: '#FFFFFF',
    inputBorder: '#E2E8F0',
};

/**
 * Nomes das coleções do Firestore para garantir consistência em toda a infraestrutura.
 */
export const FIREBASE_COLLECTIONS = {
    USERS: 'users',
    EXPENSES: 'expenses',
    PENDING_PAYMENTS: 'pendingPayments',
    GROUPS: 'groups',
};

/**
 * Canais de notificação para a API de Notificações.
 */
export const NOTIFICATION_CHANNELS = {
    EXPENSE_NOTIFICATIONS: 'expense-notifications',
};
