export interface ServerProps {
    serverId: string;
    serverName: string;
    serverImageUrl: string;
    serverBannerImageUrl: string | null;
    serverDescription: string | null;
    serverInviteCode: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export type ServerRole = 'ADMIN' | 'MODERATOR' | 'GUEST';

export interface ServerMemberProps {
    memberId: string;
    role: ServerRole;
    userId: string;
    serverId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServerResponseProps {
    server: ServerProps;
    member: ServerMemberProps;
}