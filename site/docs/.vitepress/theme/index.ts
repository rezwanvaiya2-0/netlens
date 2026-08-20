import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { onMounted } from 'vue'
import mermaid from 'mermaid'
import './custom.css'
import Layout from './Layout.vue'

const renderMermaid = () => {
	mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' })
	void mermaid.run({ querySelector: '.mermaid' })
}

const setupInstallTerminal = () => {
	const terminal = document.querySelector<HTMLElement>('[data-install-terminal]')
	if (!terminal || terminal.dataset.ready === 'true') return
	terminal.dataset.ready = 'true'
	const lines = [...terminal.querySelectorAll<HTMLElement>('[data-install-line]')]
	const cursor = terminal.querySelector<HTMLElement>('[data-install-cursor]')
	let lineIndex = 0
	let charIndex = 0
	const type = () => {
		if (lineIndex >= lines.length) {
			if (cursor) cursor.classList.add('is-visible')
			return
		}
		const line = lines[lineIndex]
		const value = line.dataset.installLine ?? ''
		line.textContent = value.slice(0, charIndex)
		charIndex += 1
		if (charIndex > value.length) {
			lineIndex += 1
			charIndex = 0
			window.setTimeout(type, 180)
		} else {
			window.setTimeout(type, 22)
		}
	}
	type()
	const copy = terminal.querySelector<HTMLButtonElement>('[data-copy-install]')
	copy?.addEventListener('click', async () => {
		const text = lines.map((line) => line.dataset.installLine).join('\n')
		await navigator.clipboard?.writeText(text)
		copy.textContent = 'Copied!'
		window.setTimeout(() => { copy.textContent = 'Copy' }, 1600)
	})
}

export default {
	extends: DefaultTheme,
 Layout,
	enhanceApp({ router }) {
		if (typeof window === 'undefined') return
		onMounted(() => window.requestAnimationFrame(() => { renderMermaid(); setupInstallTerminal() }))
		router.onAfterRouteChanged = () => window.requestAnimationFrame(() => { renderMermaid(); setupInstallTerminal() })
	}
} satisfies Theme
