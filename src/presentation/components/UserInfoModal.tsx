import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';
import { User } from '../../domain/entities/User';

/**
 * Interface para as propriedades do UserInfoModal.
 */
interface UserInfoModalProps {
    /** Controla a visibilidade do modal */
    visible: boolean;
    /** Callback para fechar o modal */
    onClose: () => void;
    /** Objeto do usuário cujas informações serão exibidas */
    user: User;
}

/**
 * @component UserInfoModal
 * Modal detalhado para exibição do perfil de um usuário.
 * Mostra:
 * - Foto de perfil (ou inicial do nome).
 * - Nome completo, Apelido, E-mail e Bio.
 * - Ícones temáticos para cada campo informativo.
 */
export const UserInfoModal: React.FC<UserInfoModalProps> = ({ visible, onClose, user }) => {
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Botão Fechar em X */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={28} color={COLORS.text} />
                    </TouchableOpacity>

                    {/* Área da Foto/Avatar */}
                    <View style={styles.avatarContainer}>
                        {user.photoUrl ? (
                            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>
                                    {(user.nickname || user.name).charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Lista de Informações em Rows */}
                    <View style={styles.infoContainer}>
                        {user.nickname && (
                            <View style={styles.infoRow}>
                                <Ionicons name="at" size={20} color={COLORS.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Apelido</Text>
                                    <Text style={styles.infoValue}>{user.nickname}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <Ionicons name="person" size={20} color={COLORS.primary} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Nome Completo</Text>
                                <Text style={styles.infoValue}>{user.name}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="mail" size={20} color={COLORS.primary} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>E-mail</Text>
                                <Text style={styles.infoValue}>{user.email}</Text>
                            </View>
                        </View>

                        {/* Seção de Bio (se houver) */}
                        {user.bio && (
                            <View style={styles.bioSection}>
                                <Ionicons name="document-text" size={20} color={COLORS.primary} />
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Bio</Text>
                                    <Text style={styles.bioText}>{user.bio}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 32,
        maxHeight: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 8,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: COLORS.primary,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 48,
        color: '#FFF',
        fontWeight: '900',
    },
    infoContainer: {
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '700',
    },
    bioSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    bioText: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
    },
});
