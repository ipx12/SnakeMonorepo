# 🎨 UI & Animation Guide

This guide outlines the rules and conventions for styling and animating interfaces within SnakeMonorepo.

---

## 1. UI Library & Styling

- **UI System**: Use **Watermelon UI** design components (built with Radix UI primitives, Sonner & Tailwind CSS v4 located in `src/components/ui/` — including `Button`, `Input`, `Textarea`, `Checkbox`, `Sonner`, and `Table`).
- **Table Primitive**: Component set in [`apps/web/src/components/ui/table.tsx`](../../apps/web/src/components/ui/table.tsx) (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`) used across data displays like `/admin/users`.
- **Design Aesthetic**: Premium dark mode, glassmorphism, subtle micro-animations, and vibrant gradients.
- **Toast Notifications**: Built on **Sonner** (`apps/web/src/components/ui/sonner.tsx`) with dark glassmorphism styling, mounted globally via `<Toaster />` in `apps/web/src/app/layout.tsx`. Supports `toast.success`, `toast.error`, `toast.info`, and action buttons.

---

## 2. GSAP Animation Platform

We use **GSAP** (`gsap`) and **GSAP React** (`@gsap/react`) for high-performance 60fps micro-interactions, scoped timelines, and smooth state transitions.

### Core GSAP Rules:
- **Scoped Lifecycle & Cleanup**: Always register `gsap.registerPlugin(useGSAP)` and scope animations via `useGSAP(..., { scope: containerRef })` to ensure automatic cleanup and React 19 StrictMode compatibility.
- **Safe Interaction Handlers**: Wrap interactive user callbacks (mouse move/leave, deletion) in `contextSafe()` to guarantee automatic garbage collection and prevent memory leaks.

### UI Animation UX Standards:
- **UX-First Interactive Cards**: Keep interactive cards physically stationary. **Do not use 3D tilt/rotation** so action buttons never displace under the cursor. Use ambient cursor spotlights (`radial-gradient`), breathing aura pulses, and non-displacing effects.
- **Selective List Animation (ID-based Targeting)**: In dynamic lists (like `TaskList.tsx`), run staggered reveals only on initial load or refresh. When adding new items, **decouple the animation from DOM ordering constraints** by using a `Set` to track previous IDs and selecting the new elements via `data-task-id` attributes to animate them independently. Do not re-animate the entire list.
