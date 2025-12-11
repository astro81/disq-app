// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./server/db";
import { env } from "$env/dynamic/private";
import * as schema from "$lib/server/db/schema";

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET as string,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    emailAndPassword: { enabled: true },
    socialProviders: {
        // github: {
        //     clientId: env.GITHUB_CLIENT_ID as string,
        //     clientSecret: env.GITHUN_CLIENT_SECRET as string,
        // },
        google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            mapProfileToUser: (profile) => { 
                return { 
                    name: profile.name, 
                    displayName: profile.given_name, 
                    image: profile.picture 
                }; 
            },
        }
    },

    advanced: { cookiePrefix: "disq-app" },

    user: { 
        additionalFields: { 
            displayName: { type: "string", required: true, }, 
            profileBannerImage: { type: "string", required: false, } 
        } 
    }
});