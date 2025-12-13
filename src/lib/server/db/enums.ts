import { pgEnum } from "drizzle-orm/pg-core";

export const memberRoleEnum = pgEnum("MemberRole", ["ADMIN", "MODERATOR", "GUEST"]);
export const channelTypeEnum = pgEnum("ChannelType", ["TEXT", "VOICE", "VIDEO"]);