<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
    import { TriangleAlert, Trash2 } from "@lucide/svelte";

    let {
        username,
        form,
    }: {
        username: string
        form: Record<string, any> | null | undefined
    } = $props();

    let showConfirm = $state(false);
    let deleteInput = $state("");
    let confirmed = $derived(deleteInput === username);
</script>

{#if form?.deleteError}
    <Alert variant="destructive" class="mb-4">
        <TriangleAlert class="size-4" />
        <AlertDescription>{form.deleteError}</AlertDescription>
    </Alert>
{/if}

{#if !showConfirm}
    <Button variant="destructive" class="w-full gap-2"
            onclick={() => (showConfirm = true)}>
        <Trash2 class="size-4" /> Delete my account
    </Button>
{:else}
    <div class="rounded-md border border-destructive/40 bg-destructive/5 p-4 flex flex-col gap-3">
        <p class="text-sm">
            Type <strong class="font-semibold">{username}</strong> to confirm permanent deletion.
        </p>
        <Input
            bind:value={deleteInput}
            placeholder={username}
            class="border-destructive/50 focus-visible:ring-destructive"
        />
        <div class="flex gap-2">
            <Button variant="outline" class="flex-1"
                    onclick={() => { showConfirm = false; deleteInput = ""; }}>
                Cancel
            </Button>
            <form method="POST" action="?/deleteAccount" use:enhance class="flex-1">
                <Button type="submit" variant="destructive" class="w-full gap-2"
                        disabled={!confirmed}>
                    <Trash2 class="size-4" /> Confirm delete
                </Button>
            </form>
        </div>
    </div>
{/if}