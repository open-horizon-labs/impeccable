# Impeccable

Design skills that help AI coding tools produce better frontend interfaces.

## Install

Works with any coding agent [supported by skills](https://github.com/anthropics/skills).

```bash
npx skills add -y open-horizon-labs/impeccable
```

Then use `/audit`, `/polish`, `/simplify`, or any command below in your coding agent.

## Commands

| Command | Use it to... |
|---------|--------------|
| `/teach-impeccable` | Set up design context for your project (run once) |
| `/audit` | Find accessibility, performance, and responsive issues |
| `/critique` | Get UX feedback on hierarchy, clarity, and feel |
| `/normalize` | Align code with your design system |
| `/polish` | Make final fixes before shipping |
| `/simplify` | Remove unnecessary complexity |
| `/clarify` | Improve confusing copy and labels |
| `/optimize` | Speed up loading and rendering |
| `/harden` | Handle errors, i18n, and edge cases |
| `/animate` | Add motion that improves UX |
| `/colorize` | Add color to monochromatic designs |
| `/bolder` | Make safe designs more striking |
| `/quieter` | Tone down aggressive designs |
| `/delight` | Add moments of surprise and joy |
| `/extract` | Create reusable components |
| `/adapt` | Make designs work across devices |
| `/onboard` | Design first-time user experiences |

## What makes it different

The underlying **frontend-design** skill teaches AI tools what *not* to do:

- Don't use Inter, Roboto, Arial (overused)
- Don't use gray text on colored backgrounds
- Don't use pure black or white (always tint)
- Don't nest cards inside cards
- Don't use bounce/elastic animations

These anti-patterns fight the "AI slop" aesthetic that makes generated interfaces look generic.

## License

Apache 2.0. Based on [Anthropic's frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design). Fork of [pbakaus/impeccable](https://github.com/pbakaus/impeccable).
