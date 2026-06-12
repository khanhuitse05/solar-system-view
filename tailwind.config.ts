import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        hud: {
          bg: 'rgba(3, 7, 18, 0.58)',
          line: 'rgba(148, 163, 184, 0.22)',
          text: '#dbeafe',
          muted: '#93a4bc',
        },
      },
      boxShadow: {
        hud: '0 0 22px rgba(59, 130, 246, 0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config;
