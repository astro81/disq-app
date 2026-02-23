import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { channel, member } from "./server-schema";


export const message = pgTable("message", {
    messageId: uuid("message_id").defaultRandom().primaryKey(),
    messageContent: text("message_content").notNull(),

    messageFileUrl: text("message_file_url"),

    memberId: uuid("member_id").notNull().references(() => member.memberId, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),

    channelId: uuid("channel_id").notNull().references(() => channel.channelId, {
        onDelete: "cascade",
        onUpdate: "cascade"
    }),

    messageDeleted: boolean("message_deleted").default(false),          // soft delete

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => [
    index("messages_channel_idx").on(table.channelId),
    index("messages_member_idx").on(table.memberId),
    index("messages_channel_message_idx").on(table.channelId, table.messageId),
    index("messages_channel_not_deleted_idx").on(table.channelId, table.messageDeleted),
]);


export const conversation = pgTable("conversation", {
    conversationId: uuid("conversation_id").defaultRandom().primaryKey(),

    memberOneId: uuid("member_one_id").notNull().references(() => member.memberId, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),

    memberTwoId: uuid("member_two_id").notNull().references(() => member.memberId, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index("conversation_member_one_idx").on(table.memberOneId),
    index("conversation_member_two_idx").on(table.memberTwoId),

    uniqueIndex("conversation_unique_members").on(table.memberOneId, table.memberTwoId),
]);


export const directMessage = pgTable("direct_message", {
    directMessageId: uuid("direct_message_id").defaultRandom().primaryKey(),

    directMessageContent: text("direct_message_content").notNull(),
    directMessageFileUrl: text("direct_message_file_url"),

    memberId: uuid("member_id").notNull().references(() => member.memberId, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),

    conversationId: uuid("conversation_id").notNull().references(() => conversation.conversationId, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),

    directMessageDeleted: boolean("direct_message_deleted").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => [
  index("direct_message_member_idx").on(table.memberId),
  index("direct_message_conversation_idx").on(table.conversationId),
]);


export const messageRelations = relations(message, ({ one }) => ({
    member: one(member, {
        fields: [message.memberId],
        references: [member.memberId]
    }),
    channel: one(channel, {
        fields: [message.channelId],
        references: [channel.channelId]
    })
}));


export const conversationRelations = relations(conversation, ({ one }) => ({
    memberOne: one(member, {
        fields: [conversation.memberOneId],
        references: [member.memberId],
        relationName: "member_one",
    }),

    memberTwo: one(member, {
        fields: [conversation.memberTwoId],
        references: [member.memberId],
        relationName: "member_two",
    }),
}))


export const directMessageRelations = relations(directMessage, ({ one }) => ({
    member: one(member, {
        fields: [directMessage.memberId],
        references: [member.memberId],
    }),

    conversation: one(conversation, {
        fields: [directMessage.conversationId],
        references: [conversation.conversationId],
    }),
}));



export type Message = typeof message.$inferSelect;
export type Conversation = typeof conversation.$inferSelect;
export type DirectMessage = typeof directMessage.$inferSelect;