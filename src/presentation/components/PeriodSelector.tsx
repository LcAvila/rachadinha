import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../core/constants/constants';
import { Period } from '../../application/usecases/stats/GetFinancialStatsUseCase';

/**
 * Interface para as propriedades do PeriodSelector.
 */
interface PeriodSelectorProps {
    /** O período selecionado atualmente ('week', 'month' ou 'year') */
    current: Period;
    /** Função chamada ao selecionar um novo período */
    onChange: (p: Period) => void;
}

/**
 * @component PeriodSelector
 * Um seletor de segmentos (segmented control) para escolha de intervalos de tempo.
 * Utilizado na tela financeira para filtrar dados por Semana, Mês ou Ano.
 */
export const PeriodSelector = ({ current, onChange }: PeriodSelectorProps) => {
    return (
        <View style={styles.container}>
            {/* Opção: Semana */}
            <TouchableOpacity
                style={[styles.segment, current === 'week' && styles.activeSegment]}
                onPress={() => onChange('week')}
            >
                <Text style={[styles.text, current === 'week' && styles.activeText]}>Semana</Text>
            </TouchableOpacity>

            {/* Opção: Mês */}
            <TouchableOpacity
                style={[styles.segment, current === 'month' && styles.activeSegment]}
                onPress={() => onChange('month')}
            >
                <Text style={[styles.text, current === 'month' && styles.activeText]}>Mês</Text>
            </TouchableOpacity>

            {/* Opção: Ano */}
            <TouchableOpacity
                style={[styles.segment, current === 'year' && styles.activeSegment]}
                onPress={() => onChange('year')}
            >
                <Text style={[styles.text, current === 'year' && styles.activeText]}>Ano</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginVertical: 16,
    },
    segment: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeSegment: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    activeText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    }
});
