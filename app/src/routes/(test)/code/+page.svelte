<script lang="ts">
    import { createHighlighter, type Highlighter } from 'shiki';

    const languages = [
        'javascript',
        'typescript',
        'python',
        'svelte',
        'rust',
        'tsx',
        'html',
        'css',
        'c++',
        'c#',
        'c',
        'docker',
        'json',
        'jsx',
        'lua',
        'nix',
        'razor',
    ];
    const themes = [
        'github-dark',
        'github-light',
        'nord',
        'one-dark-pro',
        'catppuccin-frappe',
        'catppuccin-latte',
        'catppuccin-macchiato',
        'catppuccin-mocha',
        'dracula',
        'dracula-soft',
        'gruvbox-dark-soft',
        'kanagawa-dragon',
        'tokyo-night',
    ];

    let code = $state(`// Svelte 5 is awesome\nfunction greet() {\n  console.log("Hello Runes!");\n}`);
    let language = $state('javascript');
    let theme = $state('github-dark');
    let highlighter = $state<Highlighter | null>(null);


    $effect(() => {
        const initHighlighter = async () => {
            const instance = await createHighlighter({
                themes: themes,
                langs: languages
            });
            highlighter = instance;
        };

        initHighlighter();
    });

    // This automatically re-calculates whenever code, language, theme,
    // or the highlighter instance changes.
    const highlightedCode = $derived.by(() => {
        if (!highlighter) return '<p class="p-4 text-gray-500">Loading Shiki...</p>';

        try {
            return highlighter.codeToHtml(code, {
                lang: language,
                theme: theme
            });
        } catch (e) {
            return `<pre class="p-4 text-red-500">Error: ${e}</pre>`;
        }
    });
</script>

<main class="max-w-6xl mx-auto p-8 font-sans">

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Inputs Section -->
        <section class="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="lang" class="text-xs font-bold uppercase tracking-wider text-gray-500">Language</label>
                    <select
                            id="lang"
                            bind:value={language}
                            class="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {#each languages as lang}
                            <option value={lang}>{lang}</option>
                        {/each}
                    </select>
                </div>

                <div>
                    <label for="theme" class="text-xs font-bold uppercase tracking-wider text-gray-500">Theme</label>
                    <select
                            id="theme"
                            bind:value={theme}
                            class="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {#each themes as t}
                            <option value={t}>{t}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="flex-1">
                <label for="code" class="text-xs font-bold uppercase tracking-wider text-gray-500">Source Code</label>
                <textarea
                        id="code"
                        bind:value={code}
                        class="mt-1 block w-full h-80 font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Paste code here..."
                ></textarea>
            </div>
        </section>

        <!-- Output Section -->
        <section class="flex flex-col">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Preview</h2>
            <div class="flex-1 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800 shadow-2xl min-h-[400px]">
                <div class="shiki-wrapper h-full overflow-auto">
                    {@html highlightedCode}
                </div>
            </div>
        </section>
    </div>
</main>

<style>
    :global(.shiki-wrapper pre) {
        margin: 0;
        padding: 2rem;
        height: 100%;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 14px;
        line-height: 1.6;
        tab-size: 2;
    }

    :global(.shiki-wrapper code) {
        display: block;
        min-width: fit-content;
    }
</style>