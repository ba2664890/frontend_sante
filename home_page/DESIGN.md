---
name: Modern Vision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#cfc2d4'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#988d9e'
  outline-variant: '#4c4452'
  surface-tint: '#dfb7ff'
  primary: '#dfb7ff'
  on-primary: '#4a007f'
  primary-container: '#6b21a8'
  on-primary-container: '#d7a8ff'
  inverse-primary: '#803abd'
  secondary: '#ffb1c7'
  on-secondary: '#650031'
  secondary-container: '#be0062'
  on-secondary-container: '#ffd0dc'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#005362'
  on-tertiary-container: '#3cccea'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f1dbff'
  primary-fixed-dim: '#dfb7ff'
  on-primary-fixed: '#2d0050'
  on-primary-fixed-variant: '#661aa3'
  secondary-fixed: '#ffd9e2'
  secondary-fixed-dim: '#ffb1c7'
  on-secondary-fixed: '#3f001c'
  on-secondary-fixed-variant: '#8e0048'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  section-gap-desktop: 80px
  section-gap-mobile: 48px
  grid-margin: 24px
  grid-gutter: 24px
---

## Brand & Style

This design system is a fusion of high-precision medical technology and deeply human empathy. It is designed to evoke a sense of "Heroic Care"—positioning the platform as a sophisticated, life-saving guardian for women's health in Senegal. 

The aesthetic leverages **Glassmorphism** and **High-Contrast** elements to create a UI that feels like a digital sanctuary: advanced, secure, and luminous. By utilizing a dark backdrop with glowing accents, the interface reduces eye strain and creates a premium, clinical-yet-warm environment. The emotional goal is to replace clinical anxiety with technological confidence and cultural warmth.

## Colors

The palette is anchored in a deep, sophisticated **Midnight Navy (#0F172A)** which provides a high-contrast canvas for vibrant medical signaling. 

- **Primary (Deep Purple):** Represents wisdom, dignity, and the gravity of healthcare.
- **Secondary (Vibrant Pink):** Injects life, energy, and a connection to women's health awareness.
- **Tertiary (Cyan):** Used for "High-Tech" highlights, call-to-actions, and data visualizations, suggesting precision and innovation.
- **Gradients:** Use linear gradients from Primary to Secondary to create "Action Glows" on key interactive elements.

## Typography

The typographic strategy balances **Playfair Display**—which provides a literary, trustworthy, and traditional editorial feel—with **Nunito Sans**, a highly legible and friendly sans-serif designed for clarity in functional UI tasks.

Use Playfair Display for all major headings and impactful quotes to establish authority. Use Nunito Sans for all form fields, body copy, and navigation to ensure the platform remains accessible and easy to parse during stressful or urgent user journeys.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy is "Organic Breathing Room"—avoiding cluttered interfaces in favor of large margins and generous vertical rhythm.

Spacial hierarchy should be used to guide the eye toward "Urgent Actions" (e.g., booking a screening). Backgrounds should feature "Organic Fluid Blobs"—soft, out-of-focus gradients in Purple and Pink—that break the rigid grid and make the interface feel more human and less institutional.

## Elevation & Depth

This design system uses **Glassmorphism** as its primary depth model. Rather than traditional shadows, depth is communicated through light and transparency:

- **Surface Layers:** Use semi-transparent backgrounds (`rgba(255, 255, 255, 0.05)`) with a high **backdrop-blur (20px-40px)**.
- **Glass Strokes:** Apply a subtle 1px inner border (top-left weighted) in a low-opacity white to simulate the edge of a glass pane.
- **Glows:** Instead of drop shadows, use "Outer Glows" for active states, using the primary or secondary color with high diffusion and low opacity to make elements appear self-illuminated.

## Shapes

The shape language is defined by extreme softness and fluidity. While the base `rounded-md` is 16px, primary containers and cards should utilize a **24px to 32px corner radius** to feel approachable and modern.

Buttons are strictly **pill-shaped**, ensuring they are easily identifiable as interactive and touch-friendly elements. This "no-sharp-edges" philosophy reinforces the "Caring" aspect of the brand tone.

## Components

### Buttons
- **Primary:** Pill-shaped with a vibrant gradient (Purple to Pink) and a subtle Cyan glow on hover.
- **Secondary/Ghost:** Transparent with a Cyan border and backdrop blur.

### Cards
- Large 24px rounded corners.
- Background: Translucent Dark Navy with `backdrop-filter: blur(12px)`.
- Border: 1px semi-transparent white "glass" edge.

### Inputs & Forms
- Inputs should have a dark, recessed background with a 16px radius.
- Focus state: The border glows in Cyan, signaling "active/safe" status.

### Progress & Health Indicators
- Use Cyan for "Safe/Healthy" results and Vibrant Pink for "Action Required/Alert" states.
- Circular progress bars should use thick, rounded caps to maintain the soft shape language.

### Navigation
- A floating "Glass" dock at the bottom of mobile screens, mimicking high-end OS aesthetics.