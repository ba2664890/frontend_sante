---
name: Serene Wellness
colors:
  surface: '#fcf9f6'
  surface-dim: '#dcdad7'
  surface-bright: '#fcf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f0'
  surface-container: '#f0edea'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e5e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#534343'
  inverse-surface: '#31302f'
  inverse-on-surface: '#f3f0ed'
  outline: '#867273'
  outline-variant: '#d8c1c1'
  surface-tint: '#92484e'
  primary: '#8f464c'
  on-primary: '#ffffff'
  primary-container: '#ac5d63'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb2b6'
  secondary: '#066a5f'
  on-secondary: '#ffffff'
  secondary-container: '#a1f2e2'
  on-secondary-container: '#157165'
  tertiary: '#655959'
  on-tertiary: '#ffffff'
  tertiary-container: '#7e7272'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b6'
  on-primary-fixed: '#3c060f'
  on-primary-fixed-variant: '#753138'
  secondary-fixed: '#a1f2e2'
  secondary-fixed-dim: '#85d5c7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#efdfdf'
  tertiary-fixed-dim: '#d3c3c3'
  on-tertiary-fixed: '#22191a'
  on-tertiary-fixed-variant: '#4f4444'
  background: '#fcf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e5e2df'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
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
  container-padding: 40px
  section-gap: 80px
  element-gap: 24px
  grid-columns: '12'
  max-width: 1280px
---

## Brand & Style

The visual identity of the design system is rooted in radical empathy and feminine wellness. Designed for a sensitive healthcare context in Senegal, it prioritizes psychological safety, warmth, and reassurance. The aesthetic moves away from clinical sterility toward a "caring friend" persona—soft, approachable, and deeply human.

The style is a blend of **Soft Minimalism** and **Organic Tactility**. It utilizes expansive white space (specifically cream-toned), organic shapes, and a lack of aggressive corners to lower the user's cognitive load and anxiety. Every element is designed to feel "held" and supported, evoking a sense of hope and empowerment.

## Colors

The palette is inspired by natural pigments and soft textiles to create a calming, non-threatening environment.

- **Primary (Dusty Rose):** Used for primary actions, critical health information, and brand-heavy moments. It is sophisticated rather than "bubblegum" pink, providing an authoritative yet gentle presence.
- **Secondary (Muted Teal):** Provides a grounding, natural contrast. Used for success states, secondary navigation, and health-positive messaging.
- **Background Tones (Cream & Warm Rose):** The primary canvas is Cream White (#FDFAF7) to reduce the harsh blue-light glare of pure white. Warm Rose and Soft Sage are used for container backgrounds to differentiate content sections without using borders.

## Typography

The typography strategy balances elegance with high legibility. 

**Playfair Display** is used for headlines to convey trust, heritage, and a premium editorial feel. Its high-contrast strokes feel timeless and dignified.

**Nunito Sans** handles all functional and body text. Its rounded terminals mirror the "soft" brand personality, ensuring that even dense medical information feels accessible and friendly. 

For desktop layouts, we utilize generous line heights to ensure a comfortable reading experience for users who may be in a stressed state.

## Layout & Spacing

This design system uses a **Fixed Grid** model centered on the screen to create a sense of stability and containment. 

- **Grid:** A 12-column grid with a maximum width of 1280px.
- **Rhythm:** An 8px base unit drives all spacing. However, the system encourages "breathing room"—using 80px+ vertical gaps between major content sections to prevent the UI from feeling cluttered or overwhelming.
- **Alignment:** Content is generally center-aligned or left-aligned with significant inset margins (40px) to keep the focus on the central narrative/task.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Ambient Shadows** rather than structural lines.

- **The Layering Rule:** Content sits on the Cream White (#FDFAF7) base. Secondary information resides in Soft Sage or Warm Rose containers.
- **Shadows:** Use extremely diffused, low-opacity shadows (e.g., `box-shadow: 0 10px 30px rgba(200, 116, 122, 0.08)`). The shadows should have a slight tint of the Primary Dusty Rose to maintain color harmony and warmth.
- **Transitions:** Elements should feel like they are floating gently on the surface, not carved into it. Avoid all harsh inner shadows or high-contrast borders.

## Shapes

The shape language is defined by extreme roundedness. Sharp corners are perceived as "stabbing" or "aggressive" in a medical context; therefore, all UI elements utilize a high border-radius.

- **Organic Blobs:** Large, asymmetrical "blob" shapes in muted Sage or Rose are used as background decorations to break the rigidity of the grid.
- **Floral Motifs:** Subtle, stylized line-art of local Senegalese flora (like the Baobab flower or Hibiscus) can be used as watermark-style overlays in the corner of cards to ground the app in the local culture.

## Components

### Buttons
Primary buttons are pill-shaped with a Dusty Rose background and white text. They should include a subtle "bounce" hover effect to feel responsive and "alive." Secondary buttons use a Muted Teal outline or a Soft Sage ghost style.

### Cards
Cards are the primary container for health tips and test results. They must have a minimum border-radius of 24px. Backgrounds can vary between Warm Rose and Soft Sage to categorize information (e.g., Rose for urgent screening reminders, Sage for wellness tips).

### Input Fields
Inputs use a Soft Rose or Sage background rather than a white box with a border. This makes the form feel less like a "test" and more like a conversation. Focus states should be indicated by a soft teal glow.

### Chips & Tags
Used for tracking symptoms or health milestones. These are always pill-shaped, using low-saturation versions of the primary/secondary colors to remain unobtrusive.

### Progress Indicators
Avoid clinical "loading bars." Use "growing" floral motifs or soft, circular pulses that fill with color to represent progress in a screening journey or educational module.