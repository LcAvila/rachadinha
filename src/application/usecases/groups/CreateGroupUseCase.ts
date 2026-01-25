import { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import { Group } from '../../../domain/entities/Group';

export class CreateGroupUseCase {
    constructor(private groupRepository: IGroupRepository) { }

    async execute(name: string, userId: string, description?: string): Promise<Group> {
        return this.groupRepository.createGroup({
            name,
            description,
            createdBy: userId,
            members: [userId], // Creator is the first member
            createdAt: new Date(),
        });
    }
}
