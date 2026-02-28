// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Server, Request as BunRequest } from 'bun';

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			user: User | null;
		}

		interface Platform {
			server: Server;
			request: BunRequest;
		}
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
		interface Platform {
			env: Env
      cf: CfProperties
      ctx: ExecutionContext
		}
	}
}

export {};