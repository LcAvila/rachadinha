import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { User } from '../../../domain/entities/User';

export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(email: string, password: string): Promise<User> {
        return this.authRepository.login(email, password);
    }
}
