export interface User {
    id: string;
    name: string;
    email: string;
    nickname?: string;
    bio?: string;
    photoUrl?: string;
    pushToken?: string;
    createdAt: Date;
}
