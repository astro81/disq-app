import { getOrCreateConversation } from '$lib/remote/conversation/new-conversation.remote';
import { getCurrentServerUserMember, getMemberProfile } from '$lib/remote/member/member.remote';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {

    const serverId = params.serverId;
    const memberId = params.memberId;

    const fetchCurrentMember = async (serverId: string) => {
        const currentMember = await getCurrentServerUserMember({ serverId });

        if (!currentMember)
            throw redirect(307, `/servers/${serverId}`);

        return currentMember;
    }

    const fetchCurrentConversation = async ( memberOneId: string, memberTwoId: string ) => {
        const currentConversation = await getOrCreateConversation({ memberOneId, memberTwoId });
    
        if (!currentConversation) 
            throw redirect(307, `/servers/${serverId}`);

        return currentConversation;
    }

    const currentMember = await fetchCurrentMember(serverId);

    const currentConversation = await fetchCurrentConversation( 
        currentMember.memberId,
        memberId
    );

    const { memberOneId, memberTwoId } = currentConversation;

    const fetchMemberOne = async (memberId: string) => {
        const memberOne = await getMemberProfile({ memberId });

        if (!memberOne)
            throw redirect(307, `/servers/${serverId}`);

        return memberOne;
    };
    
    const fetchMemberTwo = async (memberId: string) => {
        const memberTwo = await getMemberProfile({ memberId });

        if (!memberOne)
            throw redirect(307, `/servers/${serverId}`);

        return memberTwo;
    };
    
    const memberOne = await fetchMemberOne(memberOneId);
    const memberTwo = await fetchMemberTwo(memberTwoId);

    const otherMember = memberOne.userId === locals.user.id ? memberTwo : memberOne

    return {
        currentConversation: currentConversation,
        memberOne: memberOne,
        memberTwo: memberTwo,
        otherMember: otherMember
    };
}) satisfies PageServerLoad;