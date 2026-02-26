<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Plus, Smile } from "lucide-svelte";
    import Input from "../ui/input/input.svelte";

    interface ChatInputProps {
        apiUrl: string;
        query: Record<string, any>;
        name: string;
        type: "conversation" | "channel";
    }

    let { apiUrl, query, name, type }: ChatInputProps = $props();

    let content = $state("");
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        isLoading = true;
        error = null;

        try {
            const params = new URLSearchParams({
                channelId: query.channelId,
                serverId: query.serverId
            });

            const formData = new FormData();
            formData.append("content", content);
            // formData.append("fileUrl", fileUrl);

            const res = await fetch(`${apiUrl}?${params.toString()}`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                error = data.error?.content?.[0] || data.error || "Failed to send messages";
                return;
            }

            content = "";

        } catch (err) {
            error = "Something went wrong";
        } finally {
            isLoading = false;
        }
    }
</script>

<div>
    <form
            onsubmit={handleSubmit}
            enctype="multipart/form-data"
            class="flex flex-col gap-4"
    >
        {#if error}
            <div class="rounded-lg bg-red-50 border border-red-200 text-red-600 p-3 text-sm">
                {error}
            </div>
        {/if}

        <div class="relative p-4 pb-6">
            <!-- open dialog to attach file            -->
            <Button
                    type="button"
                    class="absolute top-7 left-8 size-6 bg-zinc-500
                hover:bg-zinc-600 transition rounded-full p-1 flex items-center justify-center"
            >
                <Plus class="text-white dark:text-[#313338]" />
            </Button>

            <Input
                    bind:value={content}
                    disabled={isLoading}
                    placeholder={`Message ${type === "channel" ? "#" + name : name}`}
                    class="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none
                focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div class="absolute top-7 right-8">
                <Smile />
            </div>
        </div>
    </form>
</div>