// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
        interface Platform {
            env: Env
            cf: CfProperties
            ctx: ExecutionContext
        }

        interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

        interface Locals {
			session: Session | null;
			user: User | null;
		}
        
        interface Platform {
            env: Env
            cf: CfProperties
            ctx: ExecutionContext
        }
    }
}

export {};