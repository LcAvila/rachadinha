import { Group } from '../../domain/entities/Group';

export interface IGroupRepository {
    createGroup(group: Omit<Group, 'id'>): Promise<Group>;
    getUserGroups(userId: string): Promise<Group[]>;
    getGroupDetails(groupId: string): Promise<Group | null>;
    addMemberToGroup(groupId: string, userId: string): Promise<void>;
}
