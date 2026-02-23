// lib/server/uploadthing.ts
import { createUploadthing } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";

import { auth } from "$lib/server/auth";


const f = createUploadthing();


const handleAuth = async (req: Request) => {
    
    const session = await auth.api.getSession({ headers: req.headers, });

    if (!session?.user) throw new Error("Unauthorized");

    return { userId: session.user.id };
};


export const ourFileRouter = {

    serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => handleAuth(req))
        .onUploadComplete(async ({ metadata, file }) => {
            // console.log("server/uploadthing");
            // console.log("User:", metadata.userId);
            // console.log("File URL:", file.ufsUrl);
        }),

    messageFile: f(["image", "pdf", "video", "image/gif"])
        .middleware(async ({ req }) => handleAuth(req))
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("User:", metadata.userId);
            console.log("File URL:", file.ufsUrl);
        }),

} satisfies FileRouter;


export type OurFileRouter = typeof ourFileRouter;
