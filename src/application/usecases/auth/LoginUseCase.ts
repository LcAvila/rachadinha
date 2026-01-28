import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { User } from '../../../domain/entities/User';

export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(identifier: string, password: string): Promise<User> {
        return this.authRepository.login(identifier, password);
    }
}
