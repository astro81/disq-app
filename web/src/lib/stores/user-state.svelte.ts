export type User = {
    id: string
    username: string
    email: string
    displayName: string
    image: string | null
    profileBannerImage: string | null
}

function createUserStore() {
    let user = $state<User | null>(null)

    return {
        get current() { return user },
        set(value: User | null) { user = value },
        clear() { user = null },
    }
}

export const userStore = createUserStore()


// GET
// let user = $derived(userStore.current);


// SET
// $effect(() => {
// 	if (data.user) {
//     	userStore.set(data.user)
// 	} else {
// 		userStore.clear()
// 	}
// })
