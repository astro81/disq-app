// src/lib/utils/shiki.ts
import { createHighlighter, type Highlighter } from 'shiki'

let highlighter: Highlighter | null = null

const PRELOADED_LANGS = [
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
	'razor'
]

const PRELOADED_THEMES = [
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
	'tokyo-night'
]

export async function initShiki() {
    if (highlighter) return highlighter

    highlighter = await createHighlighter({
        themes: PRELOADED_THEMES,
        langs: PRELOADED_LANGS,
    })

    return highlighter
}


export async function highlight(code: string, lang: string, theme?: string, isDark: boolean = true) {
    const h = await initShiki();
    
    // Use the user-selected theme, or fallback to system preference
    const activeTheme = theme || (isDark ? 'github-dark' : 'github-light');

    return h.codeToHtml(code, {
        lang: lang || 'text',
        theme: activeTheme
    });
}