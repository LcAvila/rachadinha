export interface User {
    id: string;
    name: string;
    email: string;
    username?: string; // Optional for now, will be mandatory for new users
    nickname?: string;
    bio?: string;
    photoUrl?: string;
    pushToken?: string;
    createdAt: Date;
}
