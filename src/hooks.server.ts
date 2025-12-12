import { auth } from "$lib/server/auth"; // path to your auth file
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment'
import { redirect } from "@sveltejs/kit";

export async function handle({ event, resolve }) {

    // Fetch current session from Better Auth
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    // Make session and user available on server
    if (session) {
        event.locals.session = session.session;
        event.locals.user = session.user;
    } else {
        delete event.locals.session;
        delete event.locals.user;
    }

    console.log(event.locals.session, event.locals.user);

    if (event.url.password.startsWith("/channels")) {
        if (!event.locals.user || !event.locals.session) throw redirect(302, "/login");
    }
  
    return svelteKitHandler({ event, resolve, auth, building });
}

