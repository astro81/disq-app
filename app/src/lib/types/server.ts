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


export type ServerChannelType = "TEXT" | "VOICE" | "VIDEO";

export type ChannelProps = {
    channelId: string;
    channelName: string;
    channelType: ServerChannelType;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    serverId: string;
}

export type MemberProps = {
    memberId: string;
    role: ServerMemberRole;
    userId: string | null;
    serverId: string;
    username: string | null;
    userProfileImage: string | null;
    userDisplayName: string | null;
    userEmail: string | null;
    joinedAt: Date;
    updatedAt: Date;
}

export type ServerMemberRole = 'ADMIN' | 'MODERATOR' | 'GUEST';

export interface ServerMemberProps {
    memberId: string;
    role: ServerMemberRole;
    userId: string;
    serverId: string;
    createdAt: Date;
    updatedAt: Date;
}


export type ServerMemberAllProps = {
    memberId: string;
    role: "ADMIN" | "MODERATOR" | "GUEST";
    userId: string | null;
    username: string | null;
    userProfileImage: string | null;
    userDisplayName: string | null;
    userEmail: string | null;
    joinedAt: Date;
};


export interface ServerResponseProps {
    server: ServerProps;
    member: ServerMemberProps;
}