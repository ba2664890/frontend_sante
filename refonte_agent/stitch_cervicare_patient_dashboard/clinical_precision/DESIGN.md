---
name: Clinical Precision
colors:
  surface: '#f2fbff'
  surface-dim: '#c8dee7'
  surface-bright: '#f2fbff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e4f7ff'
  surface-container: '#dcf1fb'
  surface-container-high: '#d6ecf5'
  surface-container-highest: '#d0e6ef'
  on-surface: '#091e25'
  on-surface-variant: '#3e4949'
  inverse-surface: '#1f333a'
  inverse-on-surface: '#def4fe'
  outline: '#6f7979'
  outline-variant: '#bec9c9'
  surface-tint: '#01696c'
  primary: '#006669'
  on-primary: '#ffffff'
  primary-container: '#2a7f82'
  on-primary-container: '#ebffff'
  inverse-primary: '#85d4d6'
  secondary: '#9a4523'
  on-secondary: '#ffffff'
  secondary-container: '#ff946c'
  on-secondary-container: '#772b0a'
  tertiary: '#795500'
  on-tertiary: '#ffffff'
  tertiary-container: '#956d1d'
  on-tertiary-container: '#fffbfa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a1f0f3'
  primary-fixed-dim: '#85d4d6'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f52'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#7b2e0d'
  tertiary-fixed: '#ffdeaa'
  tertiary-fixed-dim: '#f0bf67'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#f2fbff'
  on-background: '#091e25'
  surface-variant: '#d0e6ef'
typography:
  display-lg:
    fontFamily: Literata
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Literata
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Literata
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

The design system is engineered for the CerviCare+ agent workspace, prioritizing "Clarity in the Field." The brand personality is clinical, authoritative, and unwaveringly efficient. It moves away from the soft, empathetic aesthetic of patient-facing apps toward a structured, high-utility environment that fosters trust through professional rigor.

The visual style is **Corporate / Modern** with a **Bento-grid** layout philosophy. It utilizes a sophisticated interplay of deep teals and warm sands to maintain a medical-grade atmosphere that remains approachable. The emotional response should be one of focused calm, enabling agents to process complex medical data with absolute certainty and zero visual fatigue.

## Colors

The palette is anchored in a clean, clinical background to ensure maximum legibility of medical data. 

- **Primary (Deep Teal):** Used for global navigation, primary brand elements, and authoritative headers. It represents the "Clinical Core."
- **Secondary (Terracotta):** Reserved for primary calls-to-action (CTAs) and interactive elements that require user progression.
- **Accent (Amber):** Specific to warnings, alerts, and high-priority attention flags.
- **Surface:** All interactive containers use a pure white surface to pop against the cool grey-blue background, supported by specialized teal-tinted shadows to maintain brand cohesion even in depth.

## Typography

This design system uses a three-tier typographic strategy to balance authority with utility:

1.  **Literata (Display/Headers):** Replaces Fraunces for a more refined, editorial, and trustworthy serif. It is used for patient names, section headers, and high-level summaries to provide a grounded, human touch.
2.  **Plus Jakarta Sans (UI Labels & Body):** The primary workhorse for the interface. It offers high legibility at small sizes for labels, form fields, and general navigational elements.
3.  **JetBrains Mono (Medical Data):** Crucial for "Clarity in the Field." Used exclusively for clinical readings, ID numbers, timestamps, and laboratory results to ensure no character is misread.

## Layout & Spacing

The layout utilizes a **Fixed Grid** system for the central workspace to maintain a "Bento-style" dashboard appearance. 

- **Desktop:** 12-column grid with 24px margins and 16px gutters. Modules are grouped into logical clusters (cards) that occupy fixed spans.
- **Tablet:** 8-column grid with 16px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing follows a strict 8px linear scale. Large-scale data visualization modules should utilize the `lg` (24px) padding to provide visual "breathing room" amidst dense information.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and subtle color-tinted shadows. 

- **Level 0 (Background):** #F5F7F9.
- **Level 1 (Cards/Surface):** Pure white (#FFFFFF) with a 2px vertical offset shadow. The shadow must be tinted with the Primary color (hex: #2A7F82) at 8% opacity to create a "clinical glow" rather than a muddy grey drop shadow.
- **Level 2 (Popovers/Modals):** Increased shadow spread (24px) with 12% primary tint to indicate temporary interaction layers.

Transitions between views should utilize horizontal "Slide-in" movements to maintain the mental model of a structured, physical filing system.

## Shapes

The design system employs a hierarchical rounding strategy to differentiate between structural containers and interactive elements. 

- **Structural (Cards):** 16px radius creates a modern, organized enclosure for data.
- **Actionable (Buttons):** 12px radius ensures buttons feel distinct from the containers they sit within.
- **Input (Fields):** 10px radius provides a slightly tighter look for form-heavy clinical entries.
- **Status (Badges/Chips):** Full pill (999px) is reserved exclusively for status indicators (e.g., "Pending," "Complete") to allow them to be instantly identified at a glance.

## Components

### Buttons
- **Primary:** Terracotta (#E07B54) background with White text. 12px border-radius.
- **Secondary:** Deep Teal (#2A7F82) ghost style with 1.5px border.
- **Tertiary:** Text-only with Primary color, bold weight.

### Input Fields
- White background with a 1px border (#D1D9DB).
- 10px border-radius.
- Active state uses Primary Teal (#2A7F82) border with 2px outer glow.

### Cards (Bento Boxes)
- White background, 16px radius, Teal-tinted shadow.
- Header area within cards should use a subtle 4px bottom margin to separate titles from content.

### Status Badges
- Pill-shaped (999px).
- Use Success Green (#3DAA72) for positive clinical results.
- Use Accent Amber (#F4C26A) for results requiring review.

### Lists & Data Tables
- Use `data-md` (JetBrains Mono) for all numeric values.
- Rows should have a subtle 1px bottom border (#ECEFF1) with no zebra striping to maintain a clean aesthetic.