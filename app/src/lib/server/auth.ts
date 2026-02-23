// lib/auth.ts
import { getRequestEvent } from "$app/server";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "$lib/server/db";
import { user, session, account, verification } from "$lib/server/db/schema";

import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { env } from "$env/dynamic/private";


export const auth = betterAuth({
    baseURL: env.ORIGIN,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification }
    }),

    emailAndPassword: { enabled: true },

    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
            mapProfileToUser: (profile) => { 
                return { 
                    name: profile.login, 
                    displayName: profile.name ?? profile.login,
                    image: profile.avatar_url 
                } 
            }
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile) => { 
                return { 
                    name: profile.name, 
                    displayName: profile.given_name ?? profile.name, 
                    image: profile.picture 
                }; 
            },
        },
        discord: {
            clientId: env.DISCORD_CLIENT_ID as string,
            clientSecret: env.DISCORD_CLIENT_SECRET,
            mapProfileToUser: (profile) => {
                return {
                    name: profile.username,
                    displayName: profile.global_name ?? profile.username,
                    image: profile.image_url
                }
            }
        }
    },

    user: {                                                                 // *Update user id to uuid in db
        additionalFields: { 
            displayName: { type: "string", required: true, }, 
            profileBannerImage: { type: "string", required: false, } 
        } 
    },

    advanced: { database: { generateId: "uuid" } },

    plugins: [sveltekitCookies(getRequestEvent)], // make sure this is the last plugin in the array

});