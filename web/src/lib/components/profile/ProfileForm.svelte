<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";
    import { TriangleAlert, Check, X, Pencil } from "@lucide/svelte";

    let {
        user,
        form,
    }: {
        user: { username: string; email: string; displayName: string; id: string }
        form: Record<string, any> | null | undefined
    } = $props();

    let editing = $state(false);
    let usernameVal = $state("");
    let emailVal = $state("");
    let displayNameVal = $state("");

    function startEditing() {
        usernameVal = user.username;
        emailVal = user.email;
        displayNameVal = user.displayName;
        editing = true;
    }
</script>

{#if editing}
    <form
        method="POST"
        action="?/updateProfile"
        use:enhance={() => async ({ update, result }) => {
            await update({ reset: false });
            if (result.type === "success") editing = false;
        }}
        class="flex flex-col gap-4"
    >
        {#if form?.updateError}
            <Alert variant="destructive">
                <TriangleAlert class="size-4" />
                <AlertDescription>{form.updateError}</AlertDescription>
            </Alert>
        {/if}

        <Field.Field data-invalid={form?.updateErrors?.displayName || undefined}>
            <Field.Label for="displayName">Display Name</Field.Label>
            <Input id="displayName" name="displayName" bind:value={displayNameVal} />
            {#if form?.updateErrors?.displayName}
                <Field.Error>{form.updateErrors.displayName}</Field.Error>
            {/if}
        </Field.Field>

        <Field.Field data-invalid={form?.updateErrors?.username || undefined}>
            <Field.Label for="username">Username</Field.Label>
            <Input id="username" name="username" bind:value={usernameVal} />
            {#if form?.updateErrors?.username}
                <Field.Error>{form.updateErrors.username}</Field.Error>
            {/if}
        </Field.Field>

        <Field.Field data-invalid={form?.updateErrors?.email || undefined}>
            <Field.Label for="email">Email</Field.Label>
            <Input id="email" name="email" type="email" bind:value={emailVal} />
            {#if form?.updateErrors?.email}
                <Field.Error>{form.updateErrors.email}</Field.Error>
            {/if}
        </Field.Field>

        <div class="flex gap-2 pt-1">
            <Button type="submit" class="gap-1.5">
                <Check class="size-3.5" /> Save changes
            </Button>
            <Button type="button" variant="outline" class="gap-1.5"
                    onclick={() => (editing = false)}>
                <X class="size-3.5" /> Cancel
            </Button>
        </div>
    </form>

{:else}
    <!-- View mode -->
    {#if form?.updateSuccess}
        <Alert class="mb-4 border-green-500/50 bg-green-500/5">
            <Check class="size-4 text-green-600" />
            <AlertDescription class="text-green-700 dark:text-green-400">
                Profile updated successfully.
            </AlertDescription>
        </Alert>
    {/if}

    <dl class="flex flex-col">
        {#each [
            { label: "Display Name", value: user.displayName     },
            { label: "Username",     value: `@${user.username}`  },
            { label: "Email",        value: user.email           },
            { label: "User ID",      value: user.id              },
        ] as row}
            <div class="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <dt class="text-sm text-muted-foreground w-32 shrink-0">{row.label}</dt>
                <dd class="text-sm font-medium truncate text-right max-w-[60%]">{row.value}</dd>
            </div>
        {/each}
    </dl>

    <div class="mt-4">
        <Button size="sm" class="gap-1.5" onclick={startEditing}>
            <Pencil class="size-3.5" /> Edit profile
        </Button>
    </div>
{/if}