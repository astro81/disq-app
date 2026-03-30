import { getRequestEvent, query } from "$app/server";
import { API_URL } from "$env/static/private";
import { redirect } from "@sveltejs/kit";
import z from "zod";

export const getCurrentMember = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    const { cookies } = getRequestEvent();
    
    const accessToken = cookies.get('access_token');
    if (!accessToken) redirect(307, '/login');

    const membersResponse = await fetch(`${API_URL}/api/servers/${serverId}/currentMember`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (membersResponse.status === 404) throw new Error ('Server not found')
    if (membersResponse.status === 403) throw new Error ('Access denied')
    if (!membersResponse.ok) throw new Error ('Failed to load server')

    return membersResponse.json();
})


export const getCurrentMemberList = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    const { cookies } = getRequestEvent();
    
    const accessToken = cookies.get('access_token');
    if (!accessToken) redirect(307, '/login');

    const membersResponseList = await fetch(`${API_URL}/api/servers/${serverId}/members`, {  
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (membersResponseList.status === 404) throw new Error ('Server not found')
    if (membersResponseList.status === 403) throw new Error ('Access denied')
    if (!membersResponseList.ok) throw new Error ('Failed to load server')

    return membersResponseList.ok ? membersResponseList.json() : []
})