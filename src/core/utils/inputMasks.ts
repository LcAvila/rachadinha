/**
 * @file inputMasks.ts
 * Utilitários para formatação e validação de campos de entrada.
 */

/**
 * Formata um número de telefone brasileiro.
 * @param value Valor bruto do telefone.
 * @returns Telefone formatado no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 */
export const formatPhone = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Limita a 11 dígitos
    const limited = numbers.substring(0, 11);

    // Aplica a máscara
    if (limited.length <= 2) {
        return limited;
    } else if (limited.length <= 6) {
        return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
    } else if (limited.length <= 10) {
        return `(${limited.substring(0, 2)}) ${limited.substring(2, 6)}-${limited.substring(6)}`;
    } else {
        return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7, 11)}`;
    }
};

/**
 * Formata um CPF.
 * @param value Valor bruto do CPF.
 * @returns CPF formatado no padrão XXX.XXX.XXX-XX.
 */
export const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.substring(0, 11);

    if (limited.length <= 3) {
        return limited;
    } else if (limited.length <= 6) {
        return `${limited.substring(0, 3)}.${limited.substring(3)}`;
    } else if (limited.length <= 9) {
        return `${limited.substring(0, 3)}.${limited.substring(3, 6)}.${limited.substring(6)}`;
    } else {
        return `${limited.substring(0, 3)}.${limited.substring(3, 6)}.${limited.substring(6, 9)}-${limited.substring(9, 11)}`;
    }
};

/**
 * Formata uma data no padrão DD/MM/YYYY.
 * @param value Valor bruto da data.
 * @returns Data formatada.
 */
export const formatDate = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.substring(0, 8);

    if (limited.length <= 2) {
        return limited;
    } else if (limited.length <= 4) {
        return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    } else {
        return `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4, 8)}`;
    }
};

/**
 * Valida se um email é válido.
 * @param email Email a validar.
 * @returns true se válido.
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida se um CPF é válido.
 * @param cpf CPF a validar (pode estar formatado ou não).
 * @returns true se válido.
 */
export const isValidCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
};

/**
 * Valida se um telefone brasileiro é válido.
 * @param phone Telefone a validar.
 * @returns true se válido.
 */
export const isValidPhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
};

/**
 * Valida e formata uma chave PIX.
 * @param pixKey Chave PIX a validar.
 * @param type Tipo da chave ('email', 'phone', 'cpf', 'random').
 * @returns Objeto com validação e chave formatada.
 */
export const validatePixKey = (pixKey: string, type?: 'email' | 'phone' | 'cpf' | 'random'): { valid: boolean; formatted: string; type: string } => {
    const trimmed = pixKey.trim();

    // Tenta detectar o tipo automaticamente se não fornecido
    if (!type) {
        if (isValidEmail(trimmed)) {
            type = 'email';
        } else if (isValidCPF(trimmed)) {
            type = 'cpf';
        } else if (isValidPhone(trimmed)) {
            type = 'phone';
        } else {
            type = 'random';
        }
    }

    switch (type) {
        case 'email':
            return { valid: isValidEmail(trimmed), formatted: trimmed.toLowerCase(), type: 'email' };
        case 'cpf':
            return { valid: isValidCPF(trimmed), formatted: formatCPF(trimmed), type: 'cpf' };
        case 'phone':
            const phoneNumbers = trimmed.replace(/\D/g, '');
            return { valid: isValidPhone(trimmed), formatted: formatPhone(trimmed), type: 'phone' };
        case 'random':
            // Chave aleatória deve ter 32 caracteres
            return { valid: trimmed.length === 32, formatted: trimmed, type: 'random' };
        default:
            return { valid: false, formatted: trimmed, type: 'unknown' };
    }
};

/**
 * Remove formatação de um valor.
 * @param value Valor formatado.
 * @returns Valor sem formatação (apenas números).
 */
export const removeFormatting = (value: string): string => {
    return value.replace(/\D/g, '');
};
