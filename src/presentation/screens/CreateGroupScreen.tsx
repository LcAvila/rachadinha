import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GroupRepository } from '../../infrastructure/firebase/GroupRepository';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { CreateGroupUseCase } from '../../application/usecases/groups/CreateGroupUseCase';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EmojiPickerModal } from '../components/EmojiPickerModal';
import { Toast } from '../components/Toast';
import { FlatList } from 'react-native-gesture-handler';

/**
 * @component CreateGroupScreen
 * Tela para criação de novos grupos.
 * Permite definir nome, descrição, ícone e (simular) convite de membros.
 */
export const CreateGroupScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Estados do formulário
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [emoji, setEmoji] = useState('🏠'); // Ícone padrão
    const [emailInput, setEmailInput] = useState('');
    const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const groupRepo = new GroupRepository();
    const authRepo = new AuthRepository();
    const createGroupUseCase = new CreateGroupUseCase(groupRepo);

    /**
     * Adiciona um email à lista de convidados.
     * Valida formato e duplicidade.
     */
    const handleAddEmail = () => {
        if (!emailInput || !emailInput.includes('@')) {
            setToast({ visible: true, message: 'Digite um e-mail válido 📧', type: 'error' });
            return;
        }
        if (invitedEmails.includes(emailInput)) {
            setToast({ visible: true, message: 'Este e-mail já foi adicionado', type: 'info' });
            return;
        }
        setInvitedEmails([...invitedEmails, emailInput]);
        setEmailInput('');
    };

    const removeEmail = (email: string) => {
        setInvitedEmails(invitedEmails.filter(e => e !== email));
    };

    /**
     * Cria o grupo no backend.
     */
    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Ops', 'Dê um nome para o seu grupo!');
            return;
        }

        setLoading(true);
        try {
            const user = await authRepo.getCurrentUser();
            if (user) {
                // Em um app real, enviaríamos convites para 'invitedEmails' aqui
                await createGroupUseCase.execute(name, user.id, description); // Todo: Passar emoji para o UC
                setToast({ visible: true, message: 'Grupo criado com sucesso! 🎉', type: 'success' });
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar o grupo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Novo Grupo</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.content}>
                    {/* Seção de Seleção de Ícone */}
                    <View style={styles.iconSection}>
                        <TouchableOpacity style={styles.iconCircle} onPress={() => setShowEmojiPicker(true)}>
                            <Text style={{ fontSize: 40 }}>{emoji}</Text>
                        </TouchableOpacity>
                        <Text style={styles.iconText}>Ícone do Grupo</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Nome do Grupo */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome do Grupo</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Família & Amigos"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {/* Descrição */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Descrição (Opcional)</Text>
                            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} style={[styles.inputIcon, { marginTop: 16, alignSelf: 'flex-start' }]} />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Sobre o que é este grupo?"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        {/* Convite de Membros */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Convidar Membros</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="E-mail do amigo"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={emailInput}
                                    onChangeText={setEmailInput}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={handleAddEmail} style={styles.addButton}>
                                    <Ionicons name="add" size={24} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>

                            {/* Lista de Convidados (Chips) */}
                            {invitedEmails.length > 0 && (
                                <View style={styles.inviteList}>
                                    {invitedEmails.map((email, index) => (
                                        <View key={index} style={styles.inviteItem}>
                                            <Text style={styles.inviteEmail}>{email}</Text>
                                            <TouchableOpacity onPress={() => removeEmail(email)}>
                                                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createButton, loading && { opacity: 0.7 }]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Text style={styles.createText}>Criar Grupo</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <EmojiPickerModal
                visible={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelect={setEmoji}
            />

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast({ ...toast, visible: false })}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { flexGrow: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    title: { fontSize: 22, fontWeight: '900', color: COLORS.text },
    content: { paddingHorizontal: 24, flex: 1 },
    iconSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    iconText: { color: COLORS.primary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    form: { gap: 24 },
    inputGroup: { width: '100%' },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        height: 58,
    },
    textAreaWrapper: {
        height: 120,
        alignItems: 'flex-start',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    textArea: {
        paddingTop: 16,
        height: '100%',
        textAlignVertical: 'top'
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    createButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        height: 58,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    addButton: {
        padding: 8,
    },
    inviteList: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    inviteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    inviteEmail: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: '600',
    },
});
