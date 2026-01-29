import React from 'react';
import { Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ScaleButtonProps {
    children: React.ReactNode;
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
    disabled?: boolean;
}

export const ScaleButton: React.FC<ScaleButtonProps> = ({ children, onPress, style, scaleTo = 0.96, disabled = false }) => {
    const scale = useSharedValue(1);

    // Spring config for a snappy feel
    const springConfig = {
        damping: 10,
        mass: 0.5,
        stiffness: 200,
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: disabled ? 0.6 : 1
    }));

    const onPressIn = () => {
        if (disabled) return;
        scale.value = withSpring(scaleTo, springConfig);
    };

    const onPressOut = () => {
        if (disabled) return;
        scale.value = withSpring(1, springConfig);
    };

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            delayLongPress={200} // Prevent accidental long press triggers interfering
            disabled={disabled}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
