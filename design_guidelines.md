# Design Guidelines: AI Quiz Generator SaaS

## Design Approach

**Reference-Based**: Drawing inspiration from Kahoot's playful energy, Typeform's focused question flow, Duolingo's gamification patterns, and modern SaaS aesthetics (Linear/Notion for dashboard areas).

**Core Principles**:
- Playful yet professional: Balance fun gamification with credible educational tool
- Focus-driven: Quiz-taking experience eliminates distractions, one question at a time
- Celebration-oriented: Reward correct answers with visual delight
- Data clarity: Analytics presented with visual hierarchy and scannable metrics

---

## Typography

**Fonts**: Inter (primary), Poppins (headings for personality)

**Scale**:
- Hero headings: text-5xl/text-6xl, font-bold
- Section headings: text-3xl/text-4xl, font-bold
- Card titles: text-xl/text-2xl, font-semibold
- Body text: text-base, font-normal (line-height-relaxed for readability)
- UI labels: text-sm, font-medium
- Micro-copy: text-xs, font-normal
- Stats/numbers: text-4xl/text-5xl, font-extrabold (for emphasis)

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (button groups, tags)
- Standard: p-4, gap-4 (cards, form fields)
- Section padding: p-8, py-12 (containers)
- Large spacing: p-16, py-24 (hero sections)

**Grid System**:
- Dashboard: 3-column grid (lg:grid-cols-3) for stats/metrics
- Quiz library: 2-column grid (md:grid-cols-2) for quiz cards
- Leaderboard: Single column table with alternating row backgrounds
- Mobile: Always collapse to single column

**Containers**: max-w-7xl for dashboards, max-w-3xl for quiz-taking (focus)

---

## Component Library

### Navigation
- Top bar: Sticky header with logo left, navigation center, user profile/CTA right
- Mobile: Hamburger menu with slide-out drawer
- Include: Create Quiz, My Quizzes, Leaderboard, Stats links

### Hero Section (Home)
- Full viewport height (min-h-screen) with gradient background
- Centered content: Large headline + subheadline + dual CTA buttons
- Floating quiz card preview (mockup) on right side
- Icons: Sparkles, Zap, Trophy scattered as decorative elements

### Quiz Cards (Library View)
- Rounded-xl cards with subtle shadow (shadow-lg hover:shadow-xl transition)
- Card header: Title (text-xl font-bold) + theme indicator dot
- Card body: Description (2 lines, text-sm) + metadata row (questions count, plays, accuracy)
- Card footer: Action buttons (Play, Edit, Share, Delete) with icons
- Grid layout with 2-column desktop, 1-column mobile

### Quiz Taking Interface
- Centered card (max-w-3xl) with generous padding (p-8)
- Progress bar at top (thin, 2px height, animated width transition)
- Question number badge (top-left corner, pill-shaped)
- Question text: Large (text-2xl), centered, font-semibold
- Answer options: Large touch targets (min-h-16), rounded-lg, border-2
- Selected state: Bold border, subtle background
- Correct/incorrect feedback: Green/red borders with CheckCircle/XCircle icons
- Timer: Top-right corner, countdown with Clock icon, pulses when <10s
- Navigation: Next button (large, primary CTA) bottom-right

### Results Dashboard
- Split layout: Left side (score card), Right side (performance breakdown)
- Score card: Circular progress indicator (large, animated) with percentage
- Stat boxes: Grid of metrics (questions answered, accuracy, time, streak)
- Question review: Expandable accordion showing all Q&A with correct/incorrect indicators
- Share buttons: Social icons with Share2 icon
- Retake quiz CTA: Prominent button at bottom

### Leaderboard
- Table layout with sticky header
- Columns: Rank badge, Name, Score (large font), Quizzes completed, Accuracy %
- Current user row: Highlighted with subtle background, bold text
- Top 3: Gold/silver/bronze medal icons (Trophy, Award)
- Animated entry (slide-in-right on load)

### Stats & Analytics
- Dashboard grid: 4-column on desktop (total quizzes, questions answered, accuracy, level)
- Large stat cards with icon (Sparkles for level, Target for accuracy, BarChart3 for trends)
- XP progress bar: Horizontal bar showing progress to next level
- Badges section: Grid of earned badges (grayscale for locked, full color for unlocked)
- Charts: Line chart for accuracy over time, bar chart for quiz performance

### Quiz Creation Form
- Multi-step wizard (Step 1: Details, Step 2: Questions, Step 3: Settings)
- Step indicator: Progress dots at top
- Form fields: Large inputs (p-4), clear labels (text-sm font-medium above input)
- Question builder: Add/remove buttons, drag handles for reordering
- Theme selector: Color palette swatches (large circles, active state with checkmark)
- AI generator: Prominent textarea for prompt, Sparkles icon, "Generate with AI" button

### Buttons
- Primary CTA: Large (px-8 py-4), rounded-lg, font-semibold, with icon
- Secondary: Outlined (border-2), same size as primary
- Icon buttons: Square (w-10 h-10), rounded-full, centered icon
- Hover states: Subtle scale transform (scale-105), shadow increase

### Modals/Overlays
- Centered modal with backdrop (backdrop-blur-sm)
- Modal content: max-w-2xl, rounded-2xl, p-8
- Close button: Top-right corner (X icon)

### Badges & Tags
- Pill-shaped (rounded-full), small padding (px-3 py-1)
- Icons integrated inline (sized 16px)
- Use for: Question types, difficulty levels, quiz categories

---

## Animations

**Minimal, purposeful animations**:
- Card hover: Lift effect (translateY(-4px) + shadow increase)
- Correct answer: Confetti explosion (brief, celebratory)
- Progress bars: Smooth width transitions (transition-all duration-500)
- Modal entry: Fade + scale (from scale-95 to scale-100)
- Page transitions: Crossfade (fade-in-out)

**Avoid**: Scroll-triggered animations, parallax, excessive motion

---

## Images

### Hero Section
Large, vibrant illustration or screenshot showing quiz interface in action (positioned right side of hero, floating effect with subtle shadow). Image should depict: colorful quiz cards, animated question flow, or gamification elements (badges, leaderboard).

### Empty States
Friendly illustrations for: "No quizzes yet" (books/lightbulb icon), "No results" (magnifying glass), using simple line art style.

### Achievement Badges
Icon-based badges for gamification (Trophy, Star, Flame for streaks, Brain for perfect scores) - use Lucide-react icons, no custom images needed.