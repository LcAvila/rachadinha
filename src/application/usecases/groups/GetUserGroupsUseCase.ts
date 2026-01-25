import { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import { Group } from '../../../domain/entities/Group';

export class GetUserGroupsUseCase {
    constructor(private groupRepository: IGroupRepository) { }

    async execute(userId: string): Promise<Group[]> {
        return this.groupRepository.getUserGroups(userId);
    }
}
