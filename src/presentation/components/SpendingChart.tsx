import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../core/constants/constants';
import Animated, { FadeInUp } from 'react-native-reanimated';

/**
 * Interface para os dados individuais de cada barra no gráfico.
 */
interface ChartData {
    /** Rótulo exibido abaixo da barra (ex: dia da semana ou nome curto) */
    label: string;
    /** Valor numérico que determina a altura da barra */
    value: number;
}

/**
 * Interface para as propriedades do SpendingChart.
 */
interface SpendingChartProps {
    /** Lista de dados para renderização das barras do gráfico */
    data: ChartData[];
}

/**
 * @component SpendingChart
 * Um componente de gráfico de barras simples e animado para visualização de gastos.
 * Calcula automaticamente a altura das barras proporcionalmente ao valor máximo presente nos dados.
 * Inclui animações de entrada escalonadas para cada barra.
 */
export const SpendingChart = ({ data }: SpendingChartProps) => {
    // Caso não haja dados, exibe um estado vazio amigável
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sem dados para exibir</Text>
            </View>
        );
    }

    // Calcula o valor máximo para normalização das alturas das barras
    const maxValue = Math.max(...data.map(d => d.value));
    const maxHeight = 150; // Altura máxima permitida para as barras

    return (
        <View style={styles.container}>
            <View style={styles.chartArea}>
                {data.map((item, index) => {
                    // Calcula a altura proporcional à escala
                    const height = maxValue > 0 ? (item.value / maxValue) * maxHeight : 0;
                    return (
                        <View key={index} style={styles.barContainer}>
                            <Animated.View
                                entering={FadeInUp.delay(index * 50)}
                                style={[styles.bar, { height: height || 4 }]} // Mantém altura mínima de 4
                            />
                            <Text style={styles.label}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    emptyContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 180,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    bar: {
        width: '40%',
        backgroundColor: COLORS.primary,
        borderRadius: 6,
        minHeight: 4,
    },
    label: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    }
});
