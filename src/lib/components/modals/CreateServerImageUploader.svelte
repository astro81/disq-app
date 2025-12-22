<script lang="ts">
    import { X } from "@lucide/svelte";
	import { onMount } from "svelte";

    let { imageUrl = $bindable() } = $props();

    let uploader: any = $state();
    let UploadDropzone: any = $state();

    onMount(async () => {
        // Dynamic imports — NEVER evaluated during SSR
        const uploadthing = await import("$lib/utils/uploadthing");
        const utSvelte = await import("@uploadthing/svelte");

        UploadDropzone = utSvelte.UploadDropzone;

        uploader = await uploadthing.createUploader("serverImage", {
            onClientUploadComplete: (res) => {
                imageUrl = res[0]?.ufsUrl ?? null;
            },
            onUploadError: (error: Error) => {
                alert(error.message);
            }
        });
    });
</script>

{#if uploader && UploadDropzone}

    {#if imageUrl}
        <!-- Preview -->
        <div class="relative w-full mt-2">
            <img src={imageUrl} alt="Preview" class="h-60 w-full rounded object-cover" />
            <button
                type="button"
                onclick={() => imageUrl = null}
                class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 shadow"
                aria-label="Remove image"
            >
                <X class="w-4 h-4 text-gray-800"/>
            </button>
        </div>
    {:else}
        <!-- UploadThing Dropzone -->
        <UploadDropzone
            {uploader}
            multiple={false}
            class="border-dashed border-2 border-gray-400 p-6 rounded text-center cursor-pointer"
        >
            Drag & drop or click to upload server image
        </UploadDropzone>
    {/if}

{/if}