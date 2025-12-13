import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

import { channelTypeEnum, memberRoleEnum } from "./enums";
import { user } from "./auth-schema";


export const server = pgTable("server", {
    serverId: uuid("server_id").defaultRandom().primaryKey(),
    serverName: varchar("server_name", { length: 255 }).notNull().unique(),

    serverImageUrl: text("server_image_url").notNull(), // secure_url (full CDN)
    serverImagePublicId: text("server_image_public_id").notNull(), // public_id (for transformations)
    
    serverBannerImageUrl: text("server_banner_image_url"),
    serverBannerImagePublicId: text("server_banner_image_public_id"),

    serverDescription: text("server_description"),
    
    serverInviteCode: text("invite_code").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),

    createdBy: uuid("created_by").notNull().references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
}, (table) => [
    index("server_creator_idx").on(table.createdBy),
]);

export const serversRelations = relations(server, ({ one, many }) => ({
    creator: one(user, {
        fields: [server.createdBy],
        references: [user.id],
    }),
    members: many(member),
    channels: many(channel),
}));


export const member = pgTable("member", {
    memberId: uuid("member_id").defaultRandom().primaryKey(),
    role: memberRoleEnum("role").default("GUEST").notNull(),

    userId: uuid("user_id").notNull().references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    serverId: uuid("server_id").notNull().references(() => server.serverId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index("members_profile_idx").on(table.userId),
    index("members_server_idx").on(table.serverId),
    // A user can't join the same server twice
    uniqueIndex("members_unique_user_server").on(table.userId, table.serverId)
]);

export const membersRelations = relations(member, ({ one }) => ({
    user: one(user, {
        fields: [member.userId],
        references: [user.id],
    }),
    server: one(server, {
        fields: [member.serverId],
        references: [server.serverId],
    }),
}));


export const channel = pgTable("channel", {
    channelId: uuid("channel_id").defaultRandom().primaryKey(),
    channelName: varchar("channel_name", { length: 255 }).notNull(),
    channelType: channelTypeEnum("type").default("TEXT").notNull(),

    position: integer("position").notNull(),

    userId: uuid("user_id").notNull().references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    serverId: uuid("server_id").notNull().references(() => server.serverId, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index("channels_profile_idx").on(table.userId),
    index("channels_server_idx").on(table.serverId),
    index("channel_server_type_idx").on(table.serverId, table.channelType),
    index("channels_position_idx").on(table.serverId, table.position), 
    // Prevent duplicate channel name inside same server
    uniqueIndex("channel_unique_name_per_server").on(table.serverId, table.channelName),
]);

export const channelsRelations = relations(channel, ({ one }) => ({
    user: one(user, {
        fields: [channel.userId],
        references: [user.id],
    }),
    server: one(server, {
        fields: [channel.serverId],
        references: [server.serverId],
    }),
}));



export type server = typeof server.$inferSelect;
export type channel = typeof channel.$inferSelect;
export type member = typeof member.$inferSelect;