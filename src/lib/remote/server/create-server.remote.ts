import { form, getRequestEvent } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import { randomUUID } from "crypto";

import { z } from "zod";

import { db } from "$lib/server/db";

import { server, member, channel, channelTypeEnum, memberRoleEnum } from "$lib/server/db/server-schema";


const requireAuth = () => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}


export const createServer = form(
    z.object({
        serverName: z.string().nonempty({ message: 'Server Name is required' }).min(3, 'Server name must be at least 3 characters'),
        serverImage: z.string({ message: 'Server Image is required' }).url("Server image upload failed"),
    }),
    async ({ serverName, serverImage }, invalid) => {
        console.log(serverName, serverImage);

        const user = requireAuth();
        if(!user) error(401, 'Unauthorized');

        const inviteCode = randomUUID();

        // Insert server
        const [newServer] = await db.insert(server).values({
            serverName,
            serverImageUrl: serverImage,
            serverBannerImageUrl: null,      // explicitly set
            serverDescription: null,         // explicitly set
            serverInviteCode: inviteCode,
            createdBy: user.id
        }).returning({ serverId: server.serverId });

        console.log(newServer);

        if (!newServer) throw error(500, 'Failed to create server');

        // Insert member
        const newMember = await db.insert(member).values({
            serverId: newServer.serverId,
            userId: user.id,
            role: memberRoleEnum.enumValues[0] // ADMIN
        })

        if (!newMember) throw error(500, 'Failed to add member');

        // Insert default channel
        const newChannel = await db.insert(channel).values({
            channelName: 'general',
            channelType: channelTypeEnum.enumValues[0], // TEXT
            position: 1,
            createdBy: user.id,
            serverId: newServer.serverId
        });

        if (!newChannel) throw error(500, 'Failed to create default channel');

        // Redirect after successful transaction
        redirect(303, `/channels/${newServer.serverId}`);

    }

)