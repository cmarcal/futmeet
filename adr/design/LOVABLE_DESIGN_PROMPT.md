# FutMeet - Design Prompt for Lovable.app

## Project Overview

**Application Name**: FutMeet  
**Purpose**: Help casual football players organize pickup games by managing participant lists, prioritizing certain players, and automatically sorting them into balanced teams.

**Core Features**:
1. Add players to a list (in order of arrival)
2. Assign priority to specific players
3. Sort players into X teams (determined by host)
4. Display team results with visual differentiation

**Design Philosophy**: Clean, mobile-first, sport-themed design. The green primary color evokes football fields. Card-based layouts with clear visual hierarchy. Optimized for outdoor use on mobile phones at sports fields.

---

## Design System

### Color Palette

#### Primary Colors (Football Field Green)
- **Primary Green**: `#2E7D32` (main brand color, buttons, links)
- **Primary Dark**: `#1B5E20` (hover states, emphasis)
- **Primary Light**: `#66BB6A` (subtle accents, badges)
- **Primary Container**: `#E8F5E9` (light backgrounds, hero gradient tint)

#### Accent Colors
- **Accent Orange**: `#FF6B35` (primary CTAs like "Sort Teams" button)
- **Accent Orange Dark**: `#E55A2B` (hover states)

#### Priority/Special Colors
- **Priority Gold**: `#FFC107` (priority player indicators, badges)
- **Priority Gold Light**: `#FFE082` (light priority backgrounds)

#### Team Colors (for Results Page)
- **Team 1**: Blue - `#2196F3` → `#1976D2` (gradient)
- **Team 2**: Red - `#F44336` → `#D32F2F` (gradient)
- **Team 3**: Orange - `#FF9800` → `#F57C00` (gradient)
- **Team 4**: Purple - `#9C27B0` → `#7B1FA2` (gradient)

#### Neutral Colors
- **Text Primary**: `#212121` (headings, main text)
- **Text Secondary**: `#757575` (descriptions, subtitles)
- **Background Main**: `#F5F5F5` (page background)
- **Background Card**: `#FFFFFF` (card backgrounds, sections)
- **Border**: `#E0E0E0` (dividers, input borders)

#### Semantic Colors
- **Success**: `#388E3C` (success states)
- **Error**: `#D32F2F` (error states, delete actions)
- **Warning**: `#F57C00` (warning states)

### Typography

#### Font Families
- **Brand/Headings**: Poppins (Bold for headlines, SemiBold for titles)
- **Body Text**: Inter or system sans-serif stack
- **Fallback Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`

#### Type Scale
- **Hero Heading**: `clamp(2rem, 5vw, 3.5rem)` / Poppins Bold / Color: `#2E7D32`
- **Page Title**: `clamp(2rem, 4vw, 2.5rem)` / Poppins Bold / Color: `#2E7D32`
- **Section Title**: `1.75rem` / Poppins Bold / Color: `#212121`
- **Card Title**: `1.5rem` / Poppins SemiBold / Color: `#212121`
- **Body Large**: `1.125rem` / Inter Regular / Color: `#212121`
- **Body**: `1rem` / Inter Regular / Color: `#212121`
- **Body Small**: `0.9rem` / Inter Regular / Color: `#757575`
- **Label**: `0.85rem` / Inter SemiBold / Color: `#212121`

### Spacing System
- **XS**: `4px`
- **SM**: `8px`
- **MD**: `16px`
- **LG**: `24px`
- **XL**: `32px`
- **2XL**: `48px`
- **3XL**: `64px`

### Border Radius
- **Small**: `4px`
- **Medium**: `6px`
- **Large**: `8px`
- **XL**: `12px`
- **2XL**: `16px`
- **Full**: `9999px` (pill buttons, badges)

### Shadows
- **Card Shadow**: `0 2px 8px rgba(0, 0, 0, 0.1)`
- **Card Hover**: `0 4px 16px rgba(0, 0, 0, 0.15)`
- **Button Shadow**: `0 2px 8px rgba(46, 125, 50, 0.3)`
- **Button Hover**: `0 4px 12px rgba(46, 125, 50, 0.4)`

### Responsive Breakpoints (Mobile-First)
- **Mobile**: Base (0px - 767px) - Single column, full width buttons
- **Tablet**: `768px+` - Two-column grids, side-by-side inputs
- **Desktop**: `1024px+` - Multi-column grids, max-width containers (1200px)

### Touch Targets
- Minimum: `44px × 44px` for mobile accessibility

---

## Screen 1: HomePage

### Layout Structure
```
┌─────────────────────────────┐
│ Header (Sticky)             │
│ ⚽ FutMeet                   │
├─────────────────────────────┤
│                             │
│    Hero Section             │
│  (Gradient Background)      │
│                             │
│  "Organize Your Pickup      │
│         Game"               │
│                             │
│  Description text           │
│                             │
│  ┌─────────────────┐        │
│  │  CTA Card       │        │
│  │  (White Card)   │        │
│  │                 │        │
│  │  [Create Game]  │        │
│  └─────────────────┘        │
│                             │
│  Feature Cards Grid         │
│  ┌──┐ ┌──┐ ┌──┐            │
│  │👥│ │⭐│ │⚖️│            │
│  └──┘ └──┘ └──┘            │
│                             │
│  Footer                     │
└─────────────────────────────┘
```

### Visual Specifications

#### Header
- **Height**: Auto, padding `1rem 1.5rem`
- **Background**: `#FFFFFF`
- **Shadow**: Card shadow
- **Position**: Sticky, top: 0
- **Logo**: "⚽ FutMeet" - `1.5rem`, Bold, color `#2E7D32`
- **Emoji Size**: `1.75rem`

#### Hero Section
- **Background**: `linear-gradient(135deg, #F5F5F5 0%, #E8F5E9 100%)`
- **Padding**: `3rem 0` (mobile: `2rem 0`)
- **Text Align**: Center
- **Heading**: Hero Heading style, color `#2E7D32`
- **Description**: Body Large, color `#757575`, max-width `600px`, centered
- **Spacing**: Margin-bottom `2rem` between heading and description

#### CTA Card
- **Background**: `#FFFFFF`
- **Border Radius**: `16px`
- **Padding**: `3rem 2rem` (mobile: `2rem 1.5rem`)
- **Max Width**: `600px`, centered
- **Shadow**: Card shadow
- **Text Align**: Center
- **Title**: Card Title style
- **Description**: Body, color `#757575`, margin-bottom `2rem`

#### Primary Button (Create Game)
- **Background**: `#2E7D32`
- **Color**: `#FFFFFF`
- **Padding**: `1rem 2.5rem`
- **Font Size**: `1.125rem`
- **Font Weight**: SemiBold
- **Border Radius**: `8px`
- **Shadow**: Button shadow
- **Hover**: Background `#1B5E20`, transform `translateY(-2px)`, increased shadow
- **Focus**: Outline `3px solid #66BB6A`, offset `2px`
- **Transition**: `all 0.2s`

#### Feature Cards Grid
- **Layout**: Responsive grid, `minmax(250px, 1fr)`
- **Gap**: `1.5rem`
- **Mobile**: Single column
- **Card Style**:
  - Background: `#FFFFFF`
  - Padding: `2rem`
  - Border Radius: `12px`
  - Shadow: Card shadow
  - Text Align: Center
  - Hover: `translateY(-4px)`, increased shadow
- **Icon**: `3rem`, margin-bottom `1rem`
- **Title**: `1.25rem`, color `#2E7D32`, margin-bottom `0.5rem`
- **Description**: Body Small, color `#757575`

#### Footer
- **Text Align**: Center
- **Padding**: `2rem 1.5rem`
- **Color**: `#757575`
- **Font Size**: `0.9rem`
- **Margin Top**: `4rem`

---

## Screen 2: GamePage

### Layout Structure
```
┌─────────────────────────────┐
│ Header (Sticky)             │
│ ⚽ FutMeet  ← Back to Home  │
├─────────────────────────────┤
│                             │
│ Page Header                 │
│ "Game Management"           │
│ Description                 │
│                             │
│ ┌──────────┬──────────┐    │
│ │Add Player│Team      │    │
│ │Card      │Settings  │    │
│ │          │Card      │    │
│ └──────────┴──────────┘    │
│                             │
│ Player List Section         │
│ ┌─────────────────────┐    │
│ │ Players      [5]     │    │
│ │                     │    │
│ │ [1] John ⭐ [⭐][✕] │    │
│ │ [2] Jane    [⭐][✕] │    │
│ │ [3] Mike ⭐ [⭐][✕] │    │
│ │ ...                 │    │
│ └─────────────────────┘    │
│                             │
│ Sort Section                │
│ ┌─────────────────────┐    │
│ │ Sort into Teams     │    │
│ │ Teams: [2]          │    │
│ │ [Sort into Teams →] │    │
│ └─────────────────────┘    │
└─────────────────────────────┘
```

### Visual Specifications

#### Header
- Same as HomePage
- **Additional**: "← Back to Home" link on right, color `#757575`, `0.9rem`

#### Page Header
- **Title**: Page Title style, color `#2E7D32`, margin-bottom `0.5rem`
- **Description**: Body, color `#757575`
- **Margin Bottom**: `2rem`

#### Game Controls Grid
- **Layout**: Two-column grid on tablet+, single column on mobile
- **Gap**: `1.5rem`
- **Cards**: Same card style as feature cards

##### Add Player Card
- **Title**: Card Title style
- **Form**: Flex row (mobile: stacked)
- **Input**:
  - Border: `2px solid #E0E0E0`
  - Border Radius: `6px`
  - Padding: `0.75rem`
  - Focus: Border color `#2E7D32`, no outline
  - Placeholder: "Enter player name"
- **Button**: Primary button style, same row as input (mobile: full width below)

##### Team Settings Card
- **Title**: Card Title style
- **Label**: Above input, `font-weight: 500`
- **Input**: Number input, width `80px` centered, same input style
- **Range**: Min 2, Max 10, Default 2

#### Player List Section
- **Card**: White card, padding `2rem`
- **Header**: Flex row, justify space-between
  - Title: Section Title style
  - Count Badge: Background `#66BB6A`, white text, rounded `20px`, padding `0.5rem 1rem`, SemiBold
- **Empty State**: 
  - Centered, padding `3rem`
  - Icon: `4rem` (👥)
  - Text: Body, color `#757575`

##### Player Item
- **Layout**: Flex row, align center, gap `1rem`
- **Padding**: `1rem`
- **Margin Bottom**: `0.75rem`
- **Background**: `#F5F5F5`
- **Border**: `2px solid #E0E0E0`
- **Border Radius**: `8px`
- **Hover**: Border color `#2E7D32`, shadow
- **Priority State**: 
  - Background: `linear-gradient(to right, rgba(255, 193, 7, 0.1), #F5F5F5)`
  - Border: `2px solid #FFC107`

##### Player Number Badge
- **Size**: `32px × 32px`, circular
- **Background**: `#2E7D32` (normal) or `#FFC107` (priority)
- **Color**: White (normal) or `#212121` (priority)
- **Font Weight**: Bold
- **Display**: Flex, center aligned

##### Player Info
- **Name**: `1.1rem`, SemiBold, flex-grow
- **Priority Badge**: Gold background `#FFC107`, dark text, rounded `12px`, padding `0.25rem 0.75rem`, `0.85rem`, SemiBold, text "Priority"

##### Action Buttons (Icon Buttons)
- **Size**: `36px × 36px`
- **Border**: `2px solid #E0E0E0`
- **Border Radius**: `6px`
- **Background**: Transparent
- **Hover**: Border `#FF6B35`, background `#FF6B35`, color white
- **Focus**: Outline `2px solid #FF6B35`, offset `2px`
- **Icons**: ⭐ (priority toggle), ✕ (remove)

#### Sort Section
- **Card**: White card, centered, padding `2rem`
- **Title**: Section Title style
- **Description**: Body, color `#757575`, margin-bottom `1.5rem`
- **Team Count Input**: 
  - Flex row, centered, gap `1rem`
  - Label: SemiBold
  - Input: Width `80px`, centered, same input style
- **Sort Button**: 
  - Accent orange button (`#FF6B35`)
  - Large size (`1.125rem`, padding `1rem 2.5rem`)
  - Shadow: `0 2px 8px rgba(255, 107, 53, 0.3)`
  - Hover: Background `#E55A2B`, transform `translateY(-2px)`, increased shadow

---

## Screen 3: ResultsPage

### Layout Structure
```
┌─────────────────────────────┐
│ Header (Sticky)             │
│ ⚽ FutMeet  ←Back  Home     │
├─────────────────────────────┤
│                             │
│ Page Header (Centered)      │
│ "Team Results"              │
│ Description                 │
│                             │
│ Results Summary Card        │
│ [8] [2] [4]                │
│ Players Teams Per Team      │
│                             │
│ Teams Grid                  │
│ ┌────────┐ ┌────────┐      │
│ │Team 1  │ │Team 2  │      │
│ │[Blue]  │ │[Red]   │      │
│ │        │ │        │      │
│ │1. John ⭐         │      │
│ │2. Mike            │      │
│ │3. Alex            │      │
│ │4. Chris           │      │
│ └────────┘ └────────┘      │
│                             │
│ Actions Section             │
│ [Copy Results] [New Game]   │
└─────────────────────────────┘
```

### Visual Specifications

#### Header
- Same as GamePage
- **Links**: "← Back to Game" and "Home" on right

#### Page Header
- **Text Align**: Center
- **Title**: Page Title style, color `#2E7D32`, margin-bottom `0.5rem`
- **Description**: Body Large, color `#757575`
- **Margin Bottom**: `3rem`

#### Results Summary Card
- **Background**: `#FFFFFF`
- **Padding**: `1.5rem`
- **Border Radius**: `12px`
- **Shadow**: Card shadow
- **Layout**: Flex row, space-around (mobile: stacked)
- **Gap**: `1rem`
- **Item**: 
  - Text align: Center
  - Value: `2rem`, Bold, color `#2E7D32`
  - Label: `0.9rem`, color `#757575`, margin-top `0.25rem`

#### Teams Grid
- **Layout**: Responsive grid, `minmax(280px, 1fr)`
- **Gap**: `1.5rem`
- **Mobile**: Single column

##### Team Card
- **Background**: `#FFFFFF`
- **Border Radius**: `12px`
- **Shadow**: Card shadow
- **Overflow**: Hidden
- **Hover**: `translateY(-4px)`, increased shadow

##### Team Header
- **Padding**: `1.5rem`
- **Color**: White
- **Font Size**: `1.25rem`
- **Font Weight**: Bold
- **Layout**: Flex row, space-between, align center
- **Background**: Team-specific gradient (see Team Colors above)
- **Team Number**: "Team 1", `1.5rem`
- **Player Count Badge**: 
  - Background: `rgba(255, 255, 255, 0.2)`
  - Padding: `0.25rem 0.75rem`
  - Border Radius: `12px`
  - Font Size: `0.9rem`

##### Team Players List
- **Padding**: `1.5rem`
- **Background**: `#FFFFFF`

##### Player Item in Team
- **Layout**: Flex row, align center, gap `0.75rem`
- **Padding**: `0.75rem`
- **Border Bottom**: `1px solid #E0E0E0` (last item: none)
- **Player Number**: 
  - Size: `28px × 28px`, circular
  - Background: `#F5F5F5`
  - Color: `#212121`
  - Font Size: `0.85rem`, Bold
- **Player Name**: Medium weight (`500`), flex-grow
- **Priority Badge**: Same as GamePage

#### Actions Section
- **Card**: White card, centered, padding `2rem`
- **Title**: Section Title style
- **Button Container**: Flex row, gap `1rem`, centered (mobile: stacked, full width)
- **Primary Button**: Green button style with 📋 icon
- **Secondary Button**: 
  - Background: `#F5F5F5`
  - Color: `#212121`
  - Border: `2px solid #E0E0E0`
  - Same padding as primary
  - Hover: Background `#E0E0E0`

---

## Component Library

### Buttons

#### Primary Button
- **Style**: Green background, white text
- **Size**: Padding `1rem 2.5rem`
- **Font**: `1.125rem`, SemiBold
- **Border Radius**: `8px`
- **Shadow**: `0 2px 8px rgba(46, 125, 50, 0.3)`
- **Hover**: Darker green, lift effect, increased shadow

#### Secondary Button
- **Style**: Transparent background, border
- **Size**: Same padding
- **Hover**: Background tint

#### Accent Button (Orange)
- **Style**: Orange background (`#FF6B35`)
- **Size**: Large (`1.125rem`, padding `1rem 2.5rem`)
- **Shadow**: `0 2px 8px rgba(255, 107, 53, 0.3)`
- **Hover**: Darker orange, lift effect

#### Icon Button
- **Size**: `36px × 36px`
- **Border**: `2px solid #E0E0E0`
- **Border Radius**: `6px`
- **Background**: Transparent
- **Hover**: Orange border and background

### Inputs

#### Text Input
- **Border**: `2px solid #E0E0E0`
- **Border Radius**: `6px`
- **Padding**: `0.75rem`
- **Font Size**: `1rem`
- **Focus**: Border `#2E7D32`, no outline
- **Error**: Border `#D32F2F`

#### Number Input
- Same as text input
- **Width**: `80px` when centered

### Cards

#### Standard Card
- **Background**: `#FFFFFF`
- **Border Radius**: `12px`
- **Padding**: `2rem` (mobile: `1.5rem`)
- **Shadow**: Card shadow
- **Hover**: Lift effect, increased shadow

### Badges

#### Priority Badge
- **Background**: `#FFC107`
- **Color**: `#212121`
- **Padding**: `0.25rem 0.75rem`
- **Border Radius**: `12px`
- **Font Size**: `0.85rem` (small) or `0.75rem` (team cards)
- **Font Weight**: SemiBold
- **Text**: "Priority"

#### Count Badge
- **Background**: Context color (green for players)
- **Color**: White
- **Padding**: `0.5rem 1rem`
- **Border Radius**: `20px`
- **Font Weight**: SemiBold

#### Number Badge (Circular)
- **Size**: `32px × 32px` (player list) or `28px × 28px` (team cards)
- **Shape**: Circle
- **Background**: `#2E7D32` (normal) or `#FFC107` (priority)
- **Color**: White (normal) or `#212121` (priority)
- **Font Weight**: Bold
- **Display**: Flex, center aligned

---

## User Flow Visuals

### Primary Flow
1. **HomePage** → User sees hero, clicks "Create Game"
2. **GamePage** → User adds players, sets priority, configures teams
3. **Click "Sort into Teams"** → Navigate to ResultsPage
4. **ResultsPage** → User sees balanced teams, can copy or start new game

---

## Figma Export Specifications

### Artboard Sizes
- **Mobile**: `375px × 812px` (iPhone 12/13 standard)
- **Tablet**: `768px × 1024px` (iPad standard)
- **Desktop**: `1440px × 1024px` (desktop standard)

### Design Tokens in Figma
- Create Figma variables for all colors
- Create text styles for typography scale
- Create effect styles for shadows
- Document spacing system

### Component Organization
- Create reusable components (buttons, inputs, cards, badges)
- Use auto-layout for responsive behavior
- Create variants for states (default, hover, active, disabled, error)

### Screen Exports
- Export each screen as separate pages
- Include states:
  - Empty state (no players)
  - Filled state (with players)
  - Priority state (with priority players)
- Annotate interactive elements

### Design Specifications
- Document spacing between elements
- Specify border radius values
- Note hover and focus states
- Include color contrast ratios (WCAG AA: 4.5:1 for text)

---

## Design Deliverables Checklist

- [ ] HomePage with hero, CTA, and features
- [ ] GamePage with player management interface
- [ ] ResultsPage with team cards
- [ ] Design system documentation (colors, typography, spacing)
- [ ] Component library (buttons, inputs, cards, badges)
- [ ] Responsive breakpoints (mobile, tablet, desktop)
- [ ] Hover and focus states for all interactive elements
- [ ] Empty states for all lists
- [ ] Priority player visual indicators
- [ ] Team color differentiation
- [ ] All three screens in Figma
- [ ] Design tokens/variables in Figma
- [ ] Component variants and states

---

**End of Design Prompt**
