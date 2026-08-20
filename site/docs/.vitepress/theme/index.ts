import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import mermaid from 'mermaid'
import './custom.css'

const renderMermaid = () => {
	mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' })
	void mermaid.run({ querySelector: '.mermaid' })
}

export default {
	extends: DefaultTheme,
	enhanceApp({ router }) {
		if (typeof window === 'undefined') return
		router.onAfterRouteChanged = () => window.requestAnimationFrame(renderMermaid)
	}
} satisfies Theme
