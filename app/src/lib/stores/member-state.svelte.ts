/**
 * Represents a member of the currently selected server.
 *
 * This type is typically used for UI state where the active member
 * needs to be displayed, interacted with, or referenced globally.
 */
export type CurrentMember = {
	/** Unique identifier for the member */
	memberId: string;

	/** Role of the member within the server */
	role: "MODERATOR" | "ADMIN" | "GUEST";

	/** User ID associated with this member */
	memberUserId: string;

	/** Timestamp when this member was created */
	memberCreatedAt: Date;

	/** Timestamp when this member was last updated */
	memberUpdatedAt: Date;
};

/**
 * Store responsible for managing the currently active server member.
 *
 * This store is intended to be used as a **global reactive state**, so
 * multiple components can react to member changes in real-time.
 */
export class CurrentMemberStore {
	/**
	 * Reactive state holding the currently selected member.
	 *
	 * - `null` indicates that no member is currently active.
	 * - Uses `$state` to ensure reactivity across all consumers.
	 */
	currentMember = $state<CurrentMember | null>(null);

	/**
	 * Sets the currently active member.
	 *
	 * @param member - The member to set as active
	 */
	set(member: CurrentMember) {
		this.currentMember = member;
	}

	/**
	 * Clears the currently active member.
	 *
	 * Typically called on:
	 * - User logout
	 * - Leaving the server
	 * - Navigating away from server-specific views
	 */
	clear() {
		this.currentMember = null;
	}
}

/**
 * Singleton instance of `CurrentMemberStore`.
 *
 * This instance should be imported and used wherever
 * access to the active member state is required.
 *
 * Example:
 * ```ts
 * import { currentMemberStore } from '$lib/stores/currentMemberStore';
 * 
 * // Set the active member
 * currentMemberStore.set(member);
 * 
 * // Access current member
 * console.log(currentMemberStore.currentMember);
 * ```
 */
export const currentMemberStore = new CurrentMemberStore();
