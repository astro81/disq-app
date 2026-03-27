<script lang="ts">
    import type { ActionData, PageData } from './$types'
    import { invalidateAll } from '$app/navigation'
    import { Button } from '$lib/components/ui/button/index.js'
    import * as Card from '$lib/components/ui/card/index.js'
    import { LogOut } from '@lucide/svelte'
    import BannerUpload from '$lib/components/profile/BannerUpload.svelte'
    import AvatarUpload from '$lib/components/profile/AvatarUpload.svelte'
    import ProfileForm from '$lib/components/profile/ProfileForm.svelte'
    import DangerZone from '$lib/components/profile/DangerZone.svelte'

    let { data, form }: { data: PageData; form: ActionData } = $props()

    let user = $derived(data.user);

    let avatarUploading = $state(false)
    let bannerUploading = $state(false)
    let avatarError = $state<string | null>(null)
    let bannerError = $state<string | null>(null)

    async function uploadImage(file: File, type: 'avatar' | 'banner') {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', type)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const body = await res.json()

        if (!res.ok) throw new Error(body.error ?? 'Upload failed')
        await invalidateAll()
    }

    async function handleAvatarUpload(file: File) {
        avatarUploading = true
        avatarError = null
        try { await uploadImage(file, 'avatar') }
        catch (e) { avatarError = e instanceof Error ? e.message : 'Upload failed' }
        finally { avatarUploading = false }
    }

    async function handleBannerUpload(file: File) {
        bannerUploading = true
        bannerError = null
        try { await uploadImage(file, 'banner') }
        catch (e) { bannerError = e instanceof Error ? e.message : 'Upload failed' }
        finally { bannerUploading = false }
    }
</script>

<div class="min-h-svh bg-background">
    <BannerUpload
        imageUrl={user.profileBannerImage}
        bind:uploading={bannerUploading}
        bind:error={bannerError}
        onUpload={handleBannerUpload}
    />

    <div class="px-4 md:px-10 pb-12">
        <AvatarUpload
            imageUrl={user.image}
            bind:uploading={avatarUploading}
            bind:error={avatarError}
            onUpload={handleAvatarUpload}
        />

        <div class="max-w-2xl flex flex-col gap-6 mt-4">
            <Card.Root>
                <Card.Header>
                    <Card.Title class="text-base">Profile</Card.Title>
                </Card.Header>
                <Card.Content>
                    <ProfileForm {user} {form} />
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title class="text-base">Session</Card.Title>
                </Card.Header>
                <Card.Content>
                    <form method="POST" action="/api/logout">
                        <Button type="submit" variant="outline" class="w-full gap-2">
                            <LogOut class="size-4" /> Sign out
                        </Button>
                    </form>
                </Card.Content>
            </Card.Root>

            <Card.Root class="border-destructive/40">
                <Card.Header>
                    <Card.Title class="text-base text-destructive">Danger Zone</Card.Title>
                    <Card.Description>
                        Permanently deletes your account and all data. This cannot be undone.
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <DangerZone username={user.username} {form} />
                </Card.Content>
            </Card.Root>
        </div>
    </div>
</div>