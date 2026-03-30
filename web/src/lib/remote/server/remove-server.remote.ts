import { command, getRequestEvent } from "$app/server";
import { API_URL } from "$env/static/private";
import { error, redirect } from "@sveltejs/kit";
import z from "zod";
import { getCurrentServer } from "./current-server.remote";
import { getPublicServers } from "./discover.remote";
import { getCurrentMember, getCurrentMemberList } from "../member/current-member.remote";

export const removeServer = command(
    z.object({
        serverId: z.string()
    }),
    async ({ serverId }) => {
        const { cookies } = getRequestEvent();

        const accessToken = cookies.get('access_token');
        if (!accessToken) redirect(307, '/login');

        if (!serverId) throw error(404, "Server not found");

        const res = await fetch(`${API_URL}/api/servers/remove/${serverId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = await res.json();

        if (!res.ok) {
            throw error(res.status, data?.message ?? "Failed to delete server");
        }

        await getCurrentServer({ serverId }).refresh();
        await getPublicServers().refresh();
        await getCurrentMember({ serverId }).refresh();
        await getCurrentMemberList({ serverId }).refresh();

        return data.message as string;
    }
);