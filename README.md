# Impeccable

1 skill, 17 commands, and curated anti-patterns for impeccable frontend design.

> **This is a packaging fork** of [pbakaus/impeccable](https://github.com/pbakaus/impeccable) restructured for `npx skills` installation. All credit to [Paul Bakaus](https://www.paulbakaus.com) for the original work.

## Installation

```bash
npx skills add openhorizons/impeccable
```

Or install specific skills:

```bash
npx skills add openhorizons/impeccable --skill frontend-design --skill audit --skill polish
```

## What's Included

### The Skill: frontend-design

A comprehensive design skill with 7 domain-specific references:

| Reference | Covers |
|-----------|--------|
| typography | Type systems, font pairing, modular scales, OpenType |
| color-and-contrast | OKLCH, tinted neutrals, dark mode, accessibility |
| spatial-design | Spacing systems, grids, visual hierarchy |
| motion-design | Easing curves, staggering, reduced motion |
| interaction-design | Forms, focus states, loading patterns |
| responsive-design | Mobile-first, fluid design, container queries |
| ux-writing | Button labels, error messages, empty states |

### 17 Commands

| Command | What it does |
|---------|--------------|
| `/teach-impeccable` | One-time setup: gather design context, save to config |
| `/audit` | Run technical quality checks (a11y, performance, responsive) |
| `/critique` | UX design review: hierarchy, clarity, emotional resonance |
| `/normalize` | Align with design system standards |
| `/polish` | Final pass before shipping |
| `/simplify` | Strip to essence |
| `/clarify` | Improve unclear UX copy |
| `/optimize` | Performance improvements |
| `/harden` | Error handling, i18n, edge cases |
| `/animate` | Add purposeful motion |
| `/colorize` | Introduce strategic color |
| `/bolder` | Amplify boring designs |
| `/quieter` | Tone down overly bold designs |
| `/delight` | Add moments of joy |
| `/extract` | Pull into reusable components |
| `/adapt` | Adapt for different devices |
| `/onboard` | Design onboarding flows |

### Anti-Patterns

The skill includes explicit guidance on what to avoid:

- Don't use overused fonts (Arial, Inter, system defaults)
- Don't use gray text on colored backgrounds
- Don't use pure black/gray (always tint)
- Don't wrap everything in cards or nest cards inside cards
- Don't use bounce/elastic easing (feels dated)

## Usage

Once installed, use commands in your AI coding tool:

```
/audit           # Find issues
/normalize       # Fix inconsistencies
/polish          # Final cleanup
/simplify        # Remove complexity
```

Most commands accept an optional argument to focus on a specific area:

```
/audit header
/polish checkout-form
```

## Updating

Re-run the install command to pull the latest version:

```bash
npx skills add openhorizons/impeccable -g -a claude-code -y
```

## License

Apache 2.0. See [LICENSE](LICENSE).

The frontend-design skill builds on [Anthropic's original](https://github.com/anthropics/skills/tree/main/skills/frontend-design). See [NOTICE.md](NOTICE.md) for attribution.

---

Original work by [Paul Bakaus](https://www.paulbakaus.com). Packaging fork by [Open Horizons](https://openhorizonlabs.ai).
