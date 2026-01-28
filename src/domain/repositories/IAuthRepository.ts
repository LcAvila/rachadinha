import { User } from '../entities/User';

export interface IAuthRepository {
    login(email: string, password: string): Promise<User>;
    register(email: string, password: string, name: string, username?: string): Promise<User>;
    checkUsernameAvailability(username: string): Promise<boolean>;
    updateProfile(userId: string, data: Partial<User>): Promise<void>;
    uploadProfilePhoto(userId: string, imageUri: string): Promise<string>;
    changePassword(newPassword: string): Promise<void>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    updatePushToken(userId: string, pushToken: string): Promise<void>;
}
