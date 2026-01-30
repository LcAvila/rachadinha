import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../core/constants/constants';

/**
 * Interface para as propriedades do componente AnimatedButton.
 */
interface AnimatedButtonProps {
    /** Função chamada ao pressionar o botão */
    onPress: () => void;
    /** Texto exibido no botão */
    title?: string;
    /** Estado de carregamento; se verdadeiro, exibe um ActivityIndicator */
    loading?: boolean;
    /** Se verdadeiro, desabilita interações com o botão */
    disabled?: boolean;
    /** Variante visual do botão (primário, secundário, sucesso ou outline) */
    variant?: 'primary' | 'secondary' | 'success' | 'outline';
    /** Elementos filhos para customização interna (opcional) */
    children?: React.ReactNode;
    /** Estilo customizado para o container do botão */
    style?: ViewStyle;
    /** Estilo customizado para o texto do botão */
    textStyle?: TextStyle;
}

/**
 * @component AnimatedButton
 * Um componente de botão personalizado que inclui animações de escala ao ser pressionado
 * e suporte integrado para estados de carregamento (loading).
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    onPress,
    title,
    loading = false,
    disabled = false,
    variant = 'primary',
    children,
    style,
    textStyle
}) => {
    // Valor compartilhado para a animação de escala
    const scale = useSharedValue(1);

    // Estilo animado que aplica a escala no container
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    /**
     * Acionado quando o usuário inicia o toque.
     * Encolhe o botão levemente.
     */
    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    };

    /**
     * Acionado quando o usuário encerra o toque.
     * Retorna o botão ao tamanho original.
     */
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    /**
     * Retorna o estilo de fundo com base na variante selecionada.
     */
    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'success':
                return styles.successButton;
            case 'outline':
                return styles.outlineButton;
        }
    };

    /**
     * Retorna o estilo do texto com base na variante selecionada.
     */
    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return styles.outlineText;
            default:
                return styles.buttonText;
        }
    };

    return (
        <Animated.View style={[animatedStyle]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    getButtonStyle(),
                    disabled && styles.disabled,
                    style
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#FFF'} />
                ) : (
                    children || <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: COLORS.textSecondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    successButton: {
        backgroundColor: COLORS.success,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    disabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    outlineText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
});
