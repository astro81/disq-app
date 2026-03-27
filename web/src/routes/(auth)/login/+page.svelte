<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    import { TriangleAlert, GalleryVerticalEndIcon } from "@lucide/svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";

    let { form, data }: { form: ActionData; data: PageData } = $props();

    // Show either a form action error or an OAuth error forwarded via ?message=
    let generalMessage = $derived(form?.message ?? data.oauthError ?? null);
    let identifierError = $derived(form?.errors?.identifier);
    let passwordError = $derived(form?.errors?.password);
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
        <a href="/" class="flex items-center gap-2 self-center font-medium">
            <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon class="size-4" />
            </div>
            Disq Inc.
        </a>

        <Card.Root>
            <Card.Header class="text-center">
                <Card.Title class="text-xl">Welcome back</Card.Title>
            </Card.Header>

            <Card.Content>
                {#if generalMessage}
                    <Alert variant="destructive" class="mb-4 animate-in fade-in-0 duration-300">
                        <TriangleAlert class="w-4 h-4" />
                        <AlertDescription>{generalMessage}</AlertDescription>
                    </Alert>
                {/if}

                <div class="flex flex-col gap-2">
                    {@render oauthButton({ action: "?/signInGithub", provider: "GitHub" })}
                    {@render oauthButton({ action: "?/signInGoogle", provider: "Google" })}
                </div>

                <Field.Separator class="my-4">Or continue with email</Field.Separator>

                {@render emailSignIn()}
            </Card.Content>
        </Card.Root>
    </div>
</div>

{#snippet oauthButton({ action, provider }: { action: string; provider: string })}
    <form method="POST" {action}>
        <Button variant="outline" type="submit" class="h-10 w-full">
            Continue with {provider}
        </Button>
    </form>
{/snippet}

{#snippet emailSignIn()}
    <form method="POST" action="?/signInEmail">
        <Field.Group>
            <Field.Field data-invalid={identifierError || undefined}>
                <Field.Label for="identifier">Username or Email</Field.Label>
                <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="jon@gmail.com or jon_doe"
                    required
                    aria-invalid={!!identifierError}
                />
                {#if identifierError}
                    <Field.Error>{identifierError}</Field.Error>
                {/if}
            </Field.Field>

            <Field.Field data-invalid={passwordError || undefined}>
                <div class="flex items-center justify-between">
                    <Field.Label for="password">Password</Field.Label>
                    <a href="/forgot-password" class="text-xs text-muted-foreground hover:underline">
                        Forgot password?
                    </a>
                </div>
                <Input id="password" name="password" type="password" required aria-invalid={!!passwordError} />
                {#if passwordError}
                    <Field.Error>{passwordError}</Field.Error>
                {/if}
            </Field.Field>

            <Field.Field>
                <Button type="submit" class="w-full">Sign In</Button>
            </Field.Field>

            <Field.Description class="w-full flex justify-center">
                Don't have an account?
                <a class="ml-1 text-primary hover:underline" href="/register">Sign up</a>
            </Field.Description>
        </Field.Group>
    </form>
{/snippet}