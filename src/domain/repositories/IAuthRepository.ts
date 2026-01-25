import { User } from '../entities/User';

export interface IAuthRepository {
    login(email: string, password: string): Promise<User>;
    register(email: string, password: string, name: string): Promise<User>;
    updateProfile(userId: string, data: Partial<User>): Promise<void>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    updatePushToken(userId: string, pushToken: string): Promise<void>;
}
