export interface Group {
    id: string;
    name: string;
    description?: string;
    createdBy: string; // User ID
    members: string[]; // Array of User IDs
    createdAt: Date;
    photoUrl?: string; // Optional group photo
}
