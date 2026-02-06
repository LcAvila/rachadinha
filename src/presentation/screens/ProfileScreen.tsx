import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { User } from '../../domain/entities/User';
import { COLORS } from '../../core/constants/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Toast } from '../components/Toast';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { AnimatedButton } from '../components/AnimatedButton';

/**
 * @component ProfileScreen
 * Tela de perfil do usuário.
 * Permite:
 * - Visualizar informações do usuário.
 * - Editar perfil (foto, apelido, username, bio).
 * - Alterar senha.
 * - Fazer logout.
 */
export const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    // Estados do Usuário e Edição
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [location, setLocation] = useState('');

    // Estados de UI e Processamento
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const authRepo = new AuthRepository();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const currentUser = await authRepo.getCurrentUser();
        setUser(currentUser);
        setNickname(currentUser?.nickname || '');
        setUsername(currentUser?.username || '');
        setBio(currentUser?.bio || '');
        setPhone(currentUser?.phone || '');
        setPixKey(currentUser?.pixKey || '');
        setBirthDate(currentUser?.birthDate || '');
        setLocation(currentUser?.location || '');
    };

    /**
     * Permite selecionar uma imagem da galeria e fazer upload para o perfil.
     */
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setToast({ visible: true, message: 'Precisamos de permissão para acessar suas fotos 📸', type: 'error' });
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            if (!user) return;

            const selectedImage = result.assets[0];

            // Feedback imediato (mostra foto local enquanto sobe)
            setUser({ ...user, photoUrl: selectedImage.uri });
            setUploading(true);

            try {
                // Upload para Firebase
                const photoUrl = await authRepo.uploadProfilePhoto(user.id, selectedImage.uri);
                await authRepo.updateProfile(user.id, { photoUrl });

                // Atualiza com URL remota
                setUser({ ...user, photoUrl });
                setToast({ visible: true, message: 'Foto atualizada com sucesso! 📸', type: 'success' });
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                // Reverte em caso de erro
                await loadUser();
                setToast({ visible: true, message: 'Erro ao fazer upload da foto. Tente novamente.', type: 'error' });
            } finally {
                setUploading(false);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            setToast({ visible: true, message: 'Erro ao selecionar imagem', type: 'error' });
        }
    };

    /**
     * Salva as alterações do perfil (apelido, username, bio, phone, pixKey, birthDate, location).
     */
    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Verifica disponibilidade do username se foi alterado
            if (username && username !== user.username) {
                const isAvailable = await authRepo.checkUsernameAvailability(username);
                if (!isAvailable) {
                    setToast({ visible: true, message: 'Este nome de usuário já está em uso 😕', type: 'error' });
                    setLoading(false);
                    return;
                }
            }

            await authRepo.updateProfile(user.id, { nickname, bio, username, phone, pixKey, birthDate, location });
            setUser({ ...user, nickname, bio, username, phone, pixKey, birthDate, location });
            setIsEditing(false);
            setToast({ visible: true, message: 'Perfil atualizado com sucesso! ✨', type: 'success' });
        } catch (error) {
            setToast({ visible: true, message: 'Erro ao atualizar perfil', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            await authRepo.changePassword(newPassword);
            setToast({ visible: true, message: 'Senha alterada com sucesso! 🔐', type: 'success' });
        } catch (error: any) {
            throw new Error('Erro ao alterar senha. Verifique sua senha atual.');
        }
    };

    const handleLogout = async () => {
        await authRepo.logout();
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.primary + '20', COLORS.background]}
                style={styles.background}
            />

            {/* Back Button */}
            <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={pickImage} disabled={uploading}>
                            {user.photoUrl ? (
                                <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {(user.nickname || user.name).charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            {uploading && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                            <Ionicons name="camera" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {!isEditing ? (
                        <View style={styles.infoContainer}>
                            <Text style={styles.displayName}>{user.nickname || user.name}</Text>
                            {user.username && <Text style={styles.username}>@{user.username}</Text>}
                            <Text style={styles.name}>Nome: {user.name}</Text>
                            <Text style={styles.email}>{user.email}</Text>
                            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

                            <View style={styles.extraInfoGrid}>
                                {user.phone && (
                                    <View style={styles.infoTag}>
                                        <Ionicons name="call-outline" size={14} color={COLORS.primary} />
                                        <Text style={styles.infoTagText}>{user.phone}</Text>
                                    </View>
                                )}
                                {user.pixKey && (
                                    <View style={styles.infoTag}>
                                        <Ionicons name="card-outline" size={14} color={COLORS.primary} />
                                        <Text style={styles.infoTagText}>PIX</Text>
                                    </View>
                                )}
                                {user.location && (
                                    <View style={styles.infoTag}>
                                        <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                                        <Text style={styles.infoTagText}>{user.location}</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                                <Ionicons name="pencil" size={16} color={COLORS.primary} />
                                <Text style={styles.editButtonText}>Editar Perfil</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.editContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nome Completo (não editável)</Text>
                                <TextInput
                                    style={[styles.input, styles.readOnlyInput]}
                                    value={user.name}
                                    editable={false}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nome de Usuário</Text>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                                    placeholder="Ex: joao.silva"
                                    placeholderTextColor={COLORS.textSecondary}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Apelido</Text>
                                <TextInput
                                    style={styles.input}
                                    value={nickname}
                                    onChangeText={setNickname}
                                    placeholder="Como deseja ser chamado?"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Telefone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="(00) 00000-0000"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Chave PIX</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pixKey}
                                    onChangeText={setPixKey}
                                    placeholder="CPF, Email ou Celular"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Data de Nascimento</Text>
                                <TextInput
                                    style={styles.input}
                                    value={birthDate}
                                    onChangeText={setBirthDate}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Localização</Text>
                                <TextInput
                                    style={styles.input}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Sua cidade"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.bioInput]}
                                    value={bio}
                                    onChangeText={setBio}
                                    placeholder="Conte um pouco sobre você..."
                                    placeholderTextColor={COLORS.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.editActions}>
                                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                                    <Text style={styles.cancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <AnimatedButton
                                    variant="primary"
                                    title="Salvar"
                                    onPress={handleSave}
                                    loading={loading}
                                    style={styles.saveButton}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Menu de Opções */}
                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
                        <View style={[styles.menuIcon, { backgroundColor: COLORS.primary + '10' }]}>
                            <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.menuText}>Alterar Senha</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>
            </ScrollView>

            <ChangePasswordModal
                visible={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onChangePassword={handleChangePassword}
            />

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast({ ...toast, visible: false })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingBottom: 32,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFF',
    },
    avatarText: {
        fontSize: 48,
        color: '#FFF',
        fontWeight: '900',
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    infoContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    extraInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        marginBottom: 24,
    },
    infoTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    infoTagText: {
        fontSize: 12,
        color: COLORS.text,
        fontWeight: '600',
    },
    displayName: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
        fontWeight: '600',
    },
    username: {
        fontSize: 14,
        color: COLORS.primary,
        marginBottom: 8,
        fontWeight: '700',
    },
    email: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 12,
        fontWeight: '500',
    },
    bio: {
        fontSize: 14,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.primary + '08',
        gap: 8,
    },
    editButtonText: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: 13,
        textTransform: 'uppercase',
    },
    editContainer: {
        width: '100%',
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    readOnlyInput: {
        backgroundColor: '#E2E8F0',
        color: COLORS.textSecondary,
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    saveButton: {
        flex: 1,
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
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    menu: {
        paddingHorizontal: 24,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    menuIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 20,
        paddingVertical: 16,
        marginHorizontal: 24,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#FEE2E2',
        gap: 10,
    },
    logoutText: {
        color: '#EF4444',
        fontWeight: '800',
        fontSize: 16,
    },
});
