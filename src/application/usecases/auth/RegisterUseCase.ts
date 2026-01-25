import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { User } from '../../../domain/entities/User';

export class RegisterUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(email: string, password: string, name: string): Promise<User> {
        return this.authRepository.register(email, password, name);
    }
}
