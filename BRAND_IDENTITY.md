# A Football - Brand Identity Guide

**Version:** 1.0
**Last Updated:** March 18, 2026
**Project:** Court Management System Rebrand

---

## 1. Brand Overview

**A Football** is a modern, dynamic football court management platform that embodies the energy, passion, and spirit of the beautiful game. Our brand combines premium quality with approachable simplicity, making court booking effortless and exciting.

### Brand Mission
To provide a simple, strong, and energetic platform that connects football enthusiasts with quality courts and equipment, helping build strong communities through the game we love.

---

## 2. Visual Identity

### 2.1 Logo

The A Football logo consists of two key elements:
- **Symbol:** A soccer ball containing a crown (representing premium quality and excellence)
- **Wordmark:** "Afootball" in a modern, rounded sans-serif typeface

**Logo Variations:**
- Primary: Yellow background with black elements
- Dark Version: Black background with yellow/white elements
- Monochrome: Gray/black for specific applications

**Logo Assets Location:** `/Brand/`

### 2.2 Color Palette

#### Primary Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Electric Lemon Yellow** | `#EFFD5F` | Primary brand color, CTAs, highlights, active states |
| **Smoky Black** | `#2D2D2D` | Text, icons, secondary elements |

#### Secondary Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **White** | `#FFFFFF` | Backgrounds, cards, text on dark |
| **Charcoal** | `#1A1A1A` | Body text, headings |
| **Light Gray** | `#F5F5F5` | Muted backgrounds, borders |
| **Medium Gray** | `#737373` | Muted text, labels |

#### Functional Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Success Green** | `#10B981` | Confirmations, success states |
| **Destructive Red** | `#EF4444` | Errors, cancellations, warnings |

#### Color Usage Guidelines
- **Primary Yellow:** Use for high-impact elements - primary buttons, hero sections, key highlights
- **Smoky Black:** Use for text and secondary actions
- **Never** use primary yellow for large text blocks (readability)
- Maintain minimum contrast ratio of 4.5:1 for accessibility

### 2.3 Typography

#### Font Families
- **Headings/Display:** Poppins (Primary), Montserrat (Fallback)
- **Body Text:** Inter (Primary), Roboto (Fallback)
- **UI Elements:** Inter

#### Font Weights
- **Bold/Heavy (700):** Main headings, hero text, important CTAs
- **Semibold (600):** Subheadings, emphasis
- **Medium (500):** Button text, labels
- **Regular (400):** Body copy, descriptions

#### Type Scale
```
H1: 2.5rem (40px) - Bold - Tight letter spacing (-0.5px)
H2: 2rem (32px) - Bold
H3: 1.5rem (24px) - Semibold
H4: 1.25rem (20px) - Semibold
Body: 1rem (16px) - Regular
Small: 0.875rem (14px) - Regular
```

### 2.4 UI Design Elements

#### Border Radius
- **Large components** (cards, modals): `1rem` (16px)
- **Standard** (buttons, inputs): `0.75rem` (12px)
- **Small** (badges, tags): `0.5rem` (8px)
- **Pills/rounded** (pills, avatars): `9999px` (fully rounded)

#### Shadows
- **Subtle** (cards at rest): `0 1px 2px rgba(0,0,0,0.05)`
- **Medium** (dropdowns, popovers): `0 4px 6px rgba(0,0,0,0.1)`
- **Prominent** (modals, elevated panels): `0 10px 15px rgba(0,0,0,0.1)`

#### Spacing System
Base unit: **4px**
- Use multiples of 4px for all spacing
- Common values: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

---

## 3. Brand Voice & Tone

### 3.1 Voice Characteristics
- **Energetic & Dynamic** - Reflect the excitement of football
- **Simple & Direct** - No complexity, straight to the point
- **Premium & Quality-focused** - Excellence in every interaction
- **Modern & Sporty** - Contemporary meets athletic
- **Approachable & Friendly** - Welcoming to all levels
- **Confident & Bold** - Strong presence, clear identity

### 3.2 Writing Style

#### Do's
✅ Use active voice: "Book your court" not "Your court can be booked"
✅ Be concise: "Book Now" not "Click here to proceed with booking"
✅ Show energy: "Ready to play?" not "Are you prepared to begin?"
✅ Be inclusive: "Join the action" not "Sign up if you want"
✅ Stay positive: "Game on!" not "No conflicts found"

#### Don'ts
❌ Avoid jargon: "Utilize our facility" → "Use our courts"
❌ Avoid corporate speak: "Proceed to finalize transaction" → "Complete booking"
❌ Avoid passive voice: "The court is reserved" → "You've booked the court"
❌ Avoid unnecessary words: "In order to book" → "To book"

### 3.3 Terminology Standards

| ❌ Avoid | ✅ Use Instead |
|---------|---------------|
| Facility | Court / Field / Pitch |
| Venue | Court |
| Reserve | Book |
| Customer | Player / Team |
| Purchase | Book Now |
| Utilize | Use |
| In order to | To |

### 3.4 Content Examples

**Hero Section:**
```
Your Game, Your Time, Your Court
Book premium football courts in seconds.
```

**CTA Buttons:**
```
✅ Book Now
✅ Find Your Court
✅ Join the Action
✅ Reserve Your Spot

❌ Proceed to Booking
❌ Submit Reservation Request
```

**Success Messages:**
```
✅ "Court booked! Game on!"
✅ "You're all set. See you on the field!"

❌ "Your reservation has been successfully processed"
```

---

## 4. Technical Implementation

### 4.1 Tech Stack
- **Framework:** React (TypeScript)
- **Styling:** Tailwind CSS (mandatory)
- **Component Library:** shadcn/ui
- **Icons:** Lucide React

### 4.2 Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EFFD5F',
          hover: '#E5F34A',
          active: '#DBE935',
          foreground: '#1A1A1A',
        },
        secondary: {
          DEFAULT: '#2D2D2D',
          hover: '#3D3D3D',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Montserrat', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        sm: '0.5rem',
      },
    },
  },
}
```

### 4.3 Component Patterns

#### Buttons
```tsx
// Primary Action
<button className="bg-primary text-primary-foreground hover:bg-primary-hover
                   font-medium px-6 py-3 rounded-lg transition-colors">
  Book Now
</button>

// Secondary Action
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover
                   font-medium px-6 py-3 rounded-lg transition-colors">
  Learn More
</button>

// Ghost/Outline
<button className="border-2 border-primary text-primary hover:bg-primary
                   hover:text-primary-foreground font-medium px-6 py-3 rounded-lg
                   transition-all">
  View Details
</button>
```

#### Cards
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  {/* Card content */}
</div>
```

---

## 5. Brand Applications

### 5.1 UI Components

#### Navigation
- Background: White or Smoky Black
- Active state: Primary yellow underline or background
- Hover: Subtle gray background

#### Court Cards
- White background
- Primary yellow accent on hover
- Rounded corners (12px)
- Subtle shadow at rest, elevated on hover

#### Booking Flow
- Primary yellow for CTAs ("Book Now", "Confirm")
- Clear progress indicators
- Success state: Green with checkmark
- Use primary yellow for active/current step

### 5.2 Photography & Imagery
- High-energy action shots of football
- Bright, well-lit courts
- Diverse players and teams
- Use yellow color overlays for brand consistency
- Avoid generic stock photos

### 5.3 Iconography
- Use Lucide React icon library
- Style: Outlined, modern, consistent stroke width
- Size: 20px-24px for UI elements
- Color: Match surrounding text or primary yellow for emphasis

---

## 6. Brand Personality

### What We Are
✅ Energetic
✅ Simple
✅ Premium
✅ Modern
✅ Bold
✅ Inclusive
✅ Action-oriented

### What We're Not
❌ Corporate
❌ Complicated
❌ Budget/cheap
❌ Traditional
❌ Exclusive/elitist
❌ Passive

---

## 7. Quality Checklist

Before launching any branded material, verify:

- [ ] Uses approved color palette (no random colors)
- [ ] Typography follows scale and weight guidelines
- [ ] Logo has proper clearspace (minimum 20px on all sides)
- [ ] Copy is active, concise, and energetic
- [ ] CTA buttons use primary yellow background
- [ ] Border radius is consistent (12px standard)
- [ ] Spacing uses 4px base unit multiples
- [ ] All text meets accessibility contrast requirements
- [ ] Icons are from Lucide React library
- [ ] No corporate jargon or passive voice

---

## 8. Resources & Assets

### Brand Files
- Logo files: `/Brand/`
- Design tokens: `/Agent-Skills/Dev-Skills/brand-identity/resources/design-tokens.json`
- Voice & tone guide: `/Agent-Skills/Dev-Skills/brand-identity/resources/voice-tone.md`
- Tech stack rules: `/Agent-Skills/Dev-Skills/brand-identity/resources/tech-stack.md`

### External Resources
- Google Fonts: [Poppins](https://fonts.google.com/specimen/Poppins), [Inter](https://fonts.google.com/specimen/Inter)
- Icon Library: [Lucide Icons](https://lucide.dev/)
- Component Library: [shadcn/ui](https://ui.shadcn.com/)

---

## 9. Contact & Approvals

For brand guideline questions or approval requests:
- Review this document first
- Check `/Agent-Skills/Dev-Skills/brand-identity/` for technical details
- Ensure consistency with existing implementations

---

**Document Version History**
- v1.0 - March 18, 2026 - Initial brand identity creation for A Football rebrand
