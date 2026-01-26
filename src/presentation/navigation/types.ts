import { Expense } from '../../domain/entities/Expense';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined; // Not implemented yet separately, part of Login screen toggle or separate.
    Groups: undefined;
    CreateGroup: undefined;
    Home: { screen: string; params?: any } | undefined;
    CreateExpense: undefined;
    AddItems: { expenseId: string };
    PendingExpenses: undefined;
    Profile: undefined;
    Notifications: undefined;
};
