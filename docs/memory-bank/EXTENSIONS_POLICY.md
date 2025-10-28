# Extensions Policy — EMU Alerts

## Enabled (project-required)
- ESLint (JS/TS lint)
- Prettier (format)
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- Code Spell Checker
- Path IntelliSense
- EditorConfig
- YAML

## Disabled (workspace-only)
Python + Pylance, PowerShell, Docker toolchain, Google Cloud Code, Firebase DataConnect,
Gemini Code Assist, GraphQL tooling, Android/Expo, Java/Kotlin toolchains, i18n Ally, SonarLint,
Dev Containers, XML.

Rationale: Next.js 14 + TypeScript + Tailwind only. Disable unrelated language servers and cloud toolchains
to reduce CPU/memory and avoid cross-project bleed.

This file defines the authoritative set. Keep in repo to persist across restarts and new machines.

