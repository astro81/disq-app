<script lang="ts">
    import type { ActionData } from "./$types";
    import { TriangleAlert, GalleryVerticalEndIcon } from "@lucide/svelte";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Alert, AlertDescription } from "$lib/components/ui/alert/index.js";

    let { form }: { form: ActionData } = $props();

    let generalMessage = $derived(form?.message);
    let usernameError  = $derived(form?.errors?.username);
    let emailError = $derived(form?.errors?.email);

    let password = $state("");
    let confirmPassword = $state("");

    let passwordMismatch = $derived(
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password !== confirmPassword
    );
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
                <Card.Title class="text-xl">Create your account</Card.Title>
            </Card.Header>

            <Card.Content>
                {#if generalMessage}
                    <Alert variant="destructive" class="mb-4 animate-in fade-in-0 duration-300">
                        <TriangleAlert class="w-4 h-4" />
                        <AlertDescription>{generalMessage}</AlertDescription>
                    </Alert>
                {/if}

                <div class="flex flex-col gap-2">
                    {@render oauthButton({ action: "?/signUpGithub", provider: "GitHub" })}
                    {@render oauthButton({ action: "?/signUpGoogle", provider: "Google" })}
                </div>

                <Field.Separator class="my-4">Or register with email</Field.Separator>

                {@render emailSignUp()}
            </Card.Content>
        </Card.Root>

        <Field.Description class="px-6 text-center">
            By clicking continue, you agree to our
            <a href="##" class="underline">Terms</a> and
            <a href="##" class="underline">Privacy</a>.
        </Field.Description>
    </div>
</div>

{#snippet oauthButton({ action, provider }: { action: string; provider: string })}
    <form method="POST" {action}>
        <Button variant="outline" type="submit" class="h-10 w-full">
            Continue with {provider}
        </Button>
    </form>
{/snippet}

{#snippet emailSignUp()}
    <form method="POST" action="?/signUpEmail">
        <Field.Group>
            <Field.Field data-invalid={usernameError || undefined}>
                <Field.Label for="username">Username</Field.Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="jon_doe"
                    required
                    aria-invalid={!!usernameError}
                />
                {#if usernameError}
                    <Field.Error>{usernameError}</Field.Error>
                {/if}
            </Field.Field>

            <Field.Field>
                <Field.Label for="displayName">Display Name</Field.Label>
                <Input id="displayName" name="display-name" type="text" placeholder="JonDoe" />
            </Field.Field>

            <Field.Field data-invalid={emailError || undefined}>
                <Field.Label for="email">Email</Field.Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jon@gmail.com"
                    required
                    aria-invalid={!!emailError}
                />
                {#if emailError}
                    <Field.Error>{emailError}</Field.Error>
                {/if}
            </Field.Field>

            <div class="grid grid-cols-2 gap-4">
                <Field.Field data-invalid={passwordMismatch || undefined}>
                    <Field.Label for="password">Password</Field.Label>
                    <Input id="password" name="password" type="password" bind:value={password} required />
                </Field.Field>

                <Field.Field data-invalid={passwordMismatch || undefined}>
                    <Field.Label for="confirm-password">Confirm Password</Field.Label>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        bind:value={confirmPassword}
                        required
                    />
                </Field.Field>
            </div>

            {#if passwordMismatch}
                <Field.Error>Passwords do not match.</Field.Error>
            {/if}

            <Field.Field>
                <Button type="submit" class="w-full" disabled={passwordMismatch}>
                    Create Account
                </Button>
            </Field.Field>

            <Field.Description class="w-full flex justify-center">
                Already have an account?
                <a class="ml-1 text-primary hover:underline" href="/login">Sign in</a>
            </Field.Description>
        </Field.Group>
    </form>
{/snippet}