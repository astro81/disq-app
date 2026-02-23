import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";


export type User = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    displayName: string;
    profileBannerImage?: string | null | undefined;
}


export const requireAuth = (): User => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}
