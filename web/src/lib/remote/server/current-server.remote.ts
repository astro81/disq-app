import { getRequestEvent, query } from "$app/server";
import { API_URL } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import z from "zod";

export const getCurrentServer = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    const { cookies } = getRequestEvent();
    
    const accessToken = cookies.get('access_token');
    if (!accessToken) redirect(307, '/login');

    const serverResponse = await fetch(`${API_URL}/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    

    if (serverResponse.status === 404) throw new Error ('Server not found')
    if (serverResponse.status === 403) throw new Error ('Access denied')
    if (!serverResponse.ok) throw new Error ('Failed to load server')

    return serverResponse.json();
})