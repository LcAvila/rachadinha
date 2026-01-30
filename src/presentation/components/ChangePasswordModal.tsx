import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';
import { AnimatedButton } from './AnimatedButton';

/**
 * Interface para as propriedades do ChangePasswordModal.
 */
interface ChangePasswordModalProps {
    /** Controla a visibilidade do modal */
    visible: boolean;
    /** Função chamada para fechar o modal */
    onClose: () => void;
    /** Caso de uso para alteração de senha, recebendo a senha atual e a nova */
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

/**
 * @component ChangePasswordModal
 * Modal dedicado à alteração de senha do usuário.
 * Realiza validações básicas de preenchimento, comprimento mínimo e confirmação de senha.
 * Gerencia visibilidade das senhas (ver/ocultar).
 */
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    visible,
    onClose,
    onChangePassword
}) => {
    // Estados dos campos
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados de controle de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /**
     * Valida os campos e chama a função de alteração de senha.
     */
    const handleSubmit = async () => {
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Preencha todos os campos');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            await onChangePassword(currentPassword, newPassword);
            // Limpa os campos após o sucesso
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Alterar Senha</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Senha Atual */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha Atual</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrent}
                                placeholder="Digite sua senha atual"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                                <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Nova Senha */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nova Senha</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                                placeholder="Digite sua nova senha"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                                <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirmar Nova Senha */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Nova Senha</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                                placeholder="Confirme sua nova senha"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Mensagem de Erro */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <AnimatedButton
                            variant="primary"
                            title="Alterar"
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.submitButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.text,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    eyeIcon: {
        marginLeft: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    submitButton: {
        flex: 1,
    },
});
