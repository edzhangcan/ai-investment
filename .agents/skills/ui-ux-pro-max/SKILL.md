---
name: ui-ux-pro-max
description: Pro-grade UI/UX visual engineering, frontend design systems, WCAG accessibility, typography, motion curves, and micro-interactions.
---

# UI/UX Pro Max — Interface & Visual Design Engineering

The **ui-ux-pro-max** skill is an advanced design & user experience engineering framework for creating high-conversion, aesthetically breathtaking, accessible digital products.

## Core Reference Map

| Module / Topic | Reference File | Focus |
| :--- | :--- | :--- |
| **Frontend Aesthetics & CSS** | `references/frontend-patterns.md` | Color systems, glassmorphism, fluid typography, component workflow. |

## 1. Visual Aesthetics & Design System Engineering
- **Semantic Tokens**: Define surface layers (`--bg-primary`, `--bg-surface`), text hierarchies (`--text-primary`), and status states.
- **Harmonized Palettes**: Avoid generic RGB colors (`#f00`, `#00f`). Use HSL color spaces with calibrated contrast (Deep Slate `#0b0f19`, Electric Indigo `hsl(238, 83%, 66%)`).
- **Elevation & Depth**: Multi-layered shadows (`box-shadow: 0 4px 20px -2px rgba(0,0,0,0.3)`) and glassmorphism blurs (`backdrop-filter: blur(16px)`).
- **Responsive Font Math**: Use `clamp()` for dynamic, viewport-aware fluid typography (`clamp(1.5rem, 3.5vw, 2.25rem)`).

## 2. User Experience (UX) & Accessibility
- **Cognitive Ergonomics**: Follow F-pattern or Z-pattern reading flows depending on visual density.
- **Progressive Disclosure**: Hide secondary options behind clear triggers to prevent cognitive overload.
- **Accessibility (WCAG 2.1 AA/AAA)**: Minimum 4.5:1 contrast for text, 44×44px hit targets, explicit keyboard focus indicators.

## 3. Motion Design & Micro-Interactions
- **Spring Physics**: Use cubic-bezier curves (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for spring interactions.
- **State Feedback**: Provide immediate visual feedback for hover, active, and focus states.

## 4. Zero-Placeholder Policy
- Render realistic demonstration data, production-grade typography, and dynamic generated media instead of empty gray boxes.
