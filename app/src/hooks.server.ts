import { sequence } from "@sveltejs/kit/hooks";
import { redirect, type Handle } from "@sveltejs/kit";
import { building } from '$app/environment';

import { svelteKitHandler } from "better-auth/svelte-kit";

import { auth } from "$lib/server/auth";
import { handleLoginRedirect } from "$lib/server/utils/login-redirect";
import { randomUUID } from 'node:crypto';
import { connectedClients } from '$lib/server/utils/web-sockets.ts';


const AUTH_ROUTES = ["/login"];


const authSessionHook: Handle = async ({ event, resolve }) => {
	// This sets cookies, headers, and internal auth state
	return svelteKitHandler({ auth, event, resolve, building });
};


// *Session + locals hook  
const sessionLocalsHook: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	} else {
		delete event.locals.session;
		delete event.locals.user;
	}

	return resolve(event);
};


// *Track the last visited page
const lastPathHook: Handle = async ({ event, resolve }) => {
	if (
		!building &&                                                    // Cookies don’t exist during build                            
		event.request.method === 'GET' &&                               // Only track page navigations
		!AUTH_ROUTES.some((p) => event.url.pathname.startsWith(p))      // Avoid redirect loops
	) {
		event.cookies.set(
			'disq.lastPath',
			event.url.pathname + event.url.search,
			{
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: true,
				maxAge: 60 * 10     // 10 minutes
			}
		);
	}

	return resolve(event);
};


// *Redirect logged-in users away from /login 
const loginRedirectHook: Handle = async ({ event, resolve }) => {
	if (event.locals.user && event.url.pathname === '/login') {
		const lastPath = event.cookies.get('disq.lastPath') ?? '/servers';
		throw redirect(302, lastPath);
	}

	return resolve(event);
};


// !Protected routes
const protectedRoutesHook: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/servers')) {
		if (!event.locals.user || !event.locals.session) {
			throw redirect(302, handleLoginRedirect(event));
		}
	}

	return resolve(event);
};


const socketHandlerHook: Handle = async ({ event, resolve }) => {
	const { url, platform, request } = event;

	if (url.pathname === '/ws' && request.headers.get('upgrade')?.toLowerCase() === 'websocket') {
		if (platform?.server) {
			const upgraded = platform.server.upgrade(platform.request, {
				data: {
					connectionId: randomUUID(),
					channelId: url.searchParams.get('channelId') || 'default',
				},
			});

			if (upgraded) return new Response(null, { status: 101 });
		}
	}

	return resolve(event);
};

export const handle = sequence(
	socketHandlerHook,
	authSessionHook,                     // !Must be first
	sessionLocalsHook,
	lastPathHook,
	loginRedirectHook,
	protectedRoutesHook,
);


export const websocket = {
	async open(ws) {
		connectedClients.add(ws);
		console.log(`Client connected: ${ws.data.connectionId}`);
	},

	message() { },

	close(ws) {
		connectedClients.delete(ws);
	}

}