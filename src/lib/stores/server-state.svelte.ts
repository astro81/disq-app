/**
 * Represents the currently selected server and its metadata.
 *
 * This type is typically used for UI state where the active server
 * needs to be displayed, interacted with, or referenced globally.
 */
export type CurrentServer = {
    serverId: string;
    serverName: string;
    serverImageUrl: string;
    serverBannerImageUrl: string | null;
    serverDescription: string | null;
    serverInviteCode: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;

    memberId: string;
    role: "MODERATOR" | "ADMIN" | "GUEST";
    memberUserId: string;
    memberCreatedAt: Date;
    memberUpdatedAt: Date;

    memberCount: number;
};


/**
 * Store responsible for managing the currently active server.
 *
 * This store is intended to be used as a global or shared state
 * so that multiple components can react to server changes.
 */
export class CurrentServerStore {
    /**
     * Reactive state holding the currently selected server.
     *
     * - `null` indicates that no server is currently selected
     * - Uses `$state` to ensure reactivity across consumers
     */
    currentServer = $state<CurrentServer | null>(null);

    /**
     * Sets the currently active server.
     *
     * @param server - The server to set as active
     */
    set(server: CurrentServer) {
        this.currentServer = server;
    }

    /**
     * Clears the currently active server.
     *
     * This is typically called on logout, server leave,
     * or when navigating away from server-specific views.
     */
    clear() {
        this.currentServer = null;
    }
}


/**
 * Singleton instance of the CurrentServerStore.
 *
 * This instance should be imported and used wherever
 * access to the active server state is required.
 */
export const currentServerStore = new CurrentServerStore();
