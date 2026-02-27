// /servers/discovery/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { server, member } from '$lib/server/db/server-schema';
import { sql, eq, and } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user ?? null;

	// Get all servers + member counts
	const servers = await db
		.select({
			serverId: server.serverId,
			serverName: server.serverName,
			serverDescription: server.serverDescription,
			serverImageUrl: server.serverImageUrl,
			serverBannerImageUrl: server.serverBannerImageUrl,
			createdAt: server.createdAt,
			totalMembers: sql<number>`count(${member.memberId})`.as('totalMembers')
		})
		.from(server)
		.leftJoin(member, eq(member.serverId, server.serverId))
		.groupBy(server.serverId);

	// Get servers the current user already joined
	let joinedServerIds: string[] = [];

	if (user) {
		const joined = await db
			.select({ serverId: member.serverId })
			.from(member)
			.where(eq(member.userId, user.id));

		joinedServerIds = joined.map((j) => j.serverId);
	}

	return {
		servers,
		joinedServerIds
	};
};

export const actions: Actions = {
	join: async ({ request, locals }) => {
		const user = locals.user;

		if (!user) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const serverId = formData.get('serverId')?.toString();

		if (!serverId) {
			return fail(400, { message: 'Missing serverId' });
		}

		// Check if already joined
		const existing = await db.query.member.findFirst({
			where: and(
				eq(member.userId, user.id),
				eq(member.serverId, serverId)
			)
		});

		if (!existing) {
			await db.insert(member).values({
				userId: user.id,
				serverId
			});
		}

		throw redirect(303, `/servers/${serverId}`);
	}
};