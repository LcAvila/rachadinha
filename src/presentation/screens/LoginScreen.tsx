import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { AuthRepository } from '../../infrastructure/firebase/AuthRepository';
import { LoginUseCase } from '../../application/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/auth/RegisterUseCase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/config';
import Animated, {
    FadeInUp,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants/constants';
import { Toast } from '../components/Toast';
import { AnimatedButton } from '../components/AnimatedButton';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type LoginScreenProp = StackNavigationProp<RootStackParamList, 'Login'>;

/**
 * Componente interno para as formas animadas do fundo.
 */
const AnimatedBlob = ({ delay, color, size, initialPos }: { delay: number, color: string, size: number, initialPos: { x: number, y: number } }) => {
    const translateX = useSharedValue(initialPos.x);
    const translateY = useSharedValue(initialPos.y);
    const scale = useSharedValue(1);

    useEffect(() => {
        translateX.value = withDelay(delay, withRepeat(
            withTiming(initialPos.x + 50, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        ));
        translateY.value = withDelay(delay, withRepeat(
            withTiming(initialPos.y - 70, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        ));
        scale.value = withDelay(delay, withRepeat(
            withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        ));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ],
    }));

    return (
        <Animated.View
            style={[
                styles.blob,
                { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
                animatedStyle
            ]}
        />
    );
};

/**
 * @component LoginScreen
 * Tela unificada de Autenticação com Background Animado.
 */
export const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenProp>();
    const insets = useSafeAreaInsets();

    // Estados do formulário
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const authRepo = new AuthRepository();
    const loginUseCase = new LoginUseCase(authRepo);
    const registerUseCase = new RegisterUseCase(authRepo);

    const handleAuth = async () => {
        if (!email || !password) {
            setToast({ visible: true, message: 'Preencha todos os campos 🧐', type: 'error' });
            return;
        }

        if (!isLogin) {
            if (!name || !username) {
                setToast({ visible: true, message: 'Preencha nome e usuário 😊', type: 'error' });
                return;
            }
            if (password !== confirmPassword) {
                setToast({ visible: true, message: 'As senhas não coincidem ❌', type: 'error' });
                return;
            }
            if (password.length < 6) {
                setToast({ visible: true, message: 'A senha deve ter pelo menos 6 caracteres 🔑', type: 'error' });
                return;
            }
        }

        setLoading(true);
        try {
            if (isLogin) {
                await loginUseCase.execute(email, password);
                setToast({ visible: true, message: 'Bem-vindo de volta! 🎉', type: 'success' });
            } else {
                await registerUseCase.execute(email, password, name, username);
                setToast({ visible: true, message: 'Sua conta foi criada com sucesso! 🎉', type: 'success' });
            }
        } catch (error: any) {
            console.error('Erro de autenticação:', error);
            let message = 'Algo deu errado. Tente novamente.';
            if (error.code === 'auth/invalid-email') message = 'O e-mail digitado não é válido. 📧';
            if (error.code === 'auth/user-not-found' || error.message === 'auth/user-not-found') message = 'Usuário não encontrado. Crie uma conta! 👤';
            if (error.code === 'auth/wrong-password') message = 'Senha incorreta. Tente de novo! 🔑';
            if (error.code === 'auth/email-already-in-use') message = 'Esse e-mail já está em uso. Faça login! 😉';
            if (error.code === 'auth/invalid-credential') message = 'Credenciais inválidas. Verifique seus dados. 🧐';
            setToast({ visible: true, message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email || !email.includes('@')) {
            setToast({ visible: true, message: 'Insira um e-mail válido primeiro! 📧', type: 'info' });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setToast({ visible: true, message: 'E-mail de recuperação enviado! Verifique sua caixa de entrada. 📩', type: 'success' });
        } catch (error: any) {
            setToast({ visible: true, message: 'Erro ao enviar e-mail. Tente novamente.', type: 'error' });
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Animado */}
            <LinearGradient
                colors={['#F8FAFC', '#E2E8F0', '#CBD5E1']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.blobsContainer}>
                <AnimatedBlob delay={0} color={COLORS.primary + '15'} size={300} initialPos={{ x: -100, y: -50 }} />
                <AnimatedBlob delay={1000} color={COLORS.accent + '15'} size={250} initialPos={{ x: width - 150, y: height / 3 }} />
                <AnimatedBlob delay={2000} color={COLORS.primary + '10'} size={350} initialPos={{ x: -150, y: height - 200 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        {/* Header com Logo */}
                        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.header}>
                            <View style={styles.logoWrapper}>
                                <View style={styles.logoContainer}>
                                    <Image
                                        source={require('../../../assets/logo_backup.png')}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                            <Text style={styles.brandingText}>Rachadinha</Text>
                            <Text style={styles.subBrandingText}>Divida contas, multiplique momentos</Text>
                        </Animated.View>

                        {/* Formulário */}
                        <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.formContainer}>
                            <View style={styles.card}>
                                {!isLogin && (
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nome Completo"
                                            placeholderTextColor={COLORS.textSecondary}
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>
                                )}

                                {!isLogin && (
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="at-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nome de Usuário"
                                            placeholderTextColor={COLORS.textSecondary}
                                            value={username}
                                            onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                )}

                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={isLogin ? "Usuário ou Email" : "Email"}
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType={isLogin ? "default" : "email-address"}
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Senha"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                {!isLogin && (
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Confirmar Senha"
                                            placeholderTextColor={COLORS.textSecondary}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                    </View>
                                )}

                                {isLogin && (
                                    <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                                        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                                    </TouchableOpacity>
                                )}

                                <AnimatedButton
                                    variant="primary"
                                    title={isLogin ? 'Entrar' : 'Criar Conta'}
                                    onPress={handleAuth}
                                    loading={loading}
                                    disabled={loading}
                                    style={styles.mainButton}
                                />
                            </View>

                            <TouchableOpacity onPress={() => {
                                setIsLogin(!isLogin);
                                setPassword('');
                                setConfirmPassword('');
                            }} style={styles.toggleButton}>
                                <Text style={styles.toggleText}>
                                    {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                                    <Text style={styles.toggleTextBold}>{isLogin ? 'Cadastre-se' : 'Faça login'}</Text>
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </ScrollView>

                <Toast
                    visible={toast.visible}
                    message={toast.message}
                    type={toast.type}
                    onHide={() => setToast({ ...toast, visible: false })}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    blobsContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blob: {
        position: 'absolute',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrapper: {
        padding: 5,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 16,
    },
    logoContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    logoImage: {
        width: '70%',
        height: '70%',
    },
    brandingText: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.primary,
        marginBottom: 4,
        letterSpacing: -1,
    },
    subBrandingText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textAlign: 'center',
        opacity: 0.8,
    },
    formContainer: {
        width: '100%',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: -8,
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    mainButton: {
        height: 60,
        borderRadius: 16,
    },
    toggleButton: {
        marginTop: 32,
        alignItems: 'center',
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
    toggleTextBold: {
        color: COLORS.primary,
        fontWeight: '800',
    }
});
