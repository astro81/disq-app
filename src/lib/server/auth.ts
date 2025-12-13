// lib/auth.ts
import { getRequestEvent } from "$app/server";
import { 
    BETTER_AUTH_SECRET, 

    GITHUB_CLIENT_ID, 
    GITHUN_CLIENT_SECRET, 
    GITHUB_OAUTH_REDIRECT_URI, 
    
    GOOGLE_CLIENT_ID, 
    GOOGLE_CLIENT_SECRET, 
    GOOGLE_OAUTH_REDIRECT_URI, 

    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_OAUTH_REDIRECT_URI
} from "$env/static/private";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "$lib/server/db";
import { user, session, account, verification } from "$lib/server/db/schema";

import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";


export const auth = betterAuth({
    secret: BETTER_AUTH_SECRET as string,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification }
    }),

    emailAndPassword: { enabled: true },

    socialProviders: {
        github: {
            clientId: GITHUB_CLIENT_ID as string,
            clientSecret: GITHUN_CLIENT_SECRET as string,
            redirectURI: GITHUB_OAUTH_REDIRECT_URI as string,
            mapProfileToUser: (profile) => { 
                return { 
                    name: profile.login, 
                    displayName: profile.name ?? profile.login,
                    image: profile.avatar_url 
                } 
            }
        },
        google: {
            clientId: GOOGLE_CLIENT_ID as string,
            clientSecret: GOOGLE_CLIENT_SECRET as string,
            redirectURI: GOOGLE_OAUTH_REDIRECT_URI as string,
            mapProfileToUser: (profile) => { 
                return { 
                    name: profile.name, 
                    displayName: profile.given_name ?? profile.name, 
                    image: profile.picture 
                }; 
            },
        },
        discord: {
            clientId: DISCORD_CLIENT_ID as string,
            clientSecret: DISCORD_CLIENT_SECRET as string,
            redirectURI: DISCORD_OAUTH_REDIRECT_URI,
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

    plugins: [sveltekitCookies(getRequestEvent)], // make sure this is the last plugin in the array

});