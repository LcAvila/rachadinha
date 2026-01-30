import React from 'react';
import { Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

/**
 * Interface para as propriedades do ScaleButton.
 */
interface ScaleButtonProps {
    /** Elementos internos que receberão o efeito de escala */
    children: React.ReactNode;
    /** Função executada ao clicar no botão */
    onPress?: (event: GestureResponderEvent) => void;
    /** Estilo customizado para o container animado */
    style?: StyleProp<ViewStyle>;
    /** Valor final da escala quando pressionado (padrão: 0.96) */
    scaleTo?: number;
    /** Se verdadeiro, desabilita a escala e a interação */
    disabled?: boolean;
}

/**
 * @component ScaleButton
 * Um wrapper interativo que aplica uma animação snappy de escala (zoom in/out)
 * ao ser pressionado. Utiliza `react-native-reanimated` para garantir performance fluida.
 * Ideal para cards, botões customizados e elementos clicáveis na UI.
 */
export const ScaleButton: React.FC<ScaleButtonProps> = ({ children, onPress, style, scaleTo = 0.96, disabled = false }) => {
    // Valor compartilhado para o controle da escala
    const scale = useSharedValue(1);

    // Configuração de mola (spring) para dar uma sensação tátil responsiva
    const springConfig = {
        damping: 10,
        mass: 0.5,
        stiffness: 200,
    };

    // Estilos animados para escala e opacidade (em caso de desabilitado)
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: disabled ? 0.6 : 1
    }));

    /**
     * Inicia a animação de encolhimento no início do toque.
     */
    const onPressIn = () => {
        if (disabled) return;
        scale.value = withSpring(scaleTo, springConfig);
    };

    /**
     * Retorna ao tamanho normal quando o toque é encerrado.
     */
    const onPressOut = () => {
        if (disabled) return;
        scale.value = withSpring(1, springConfig);
    };

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            delayLongPress={200} // Evita interferência em gestos de scroll longo
            disabled={disabled}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
