# UI Guidelines
## Pinili Cutlet — LAN-Based POS System

### Brand Identity
- **Brand name:** Pinili Cutlet
- **Display:** "PINILI" in white + "CUTLET" in red (#C0392B)
- **Vibe:** Premium, dark, Japanese-inspired, clean, high contrast

---

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| primary | #C0392B | Buttons, accents, active states, prices |
| primaryDark | #96281B | Button hover states |
| primaryLight | #E74C3C | Highlights |
| dark | #0A0A0A | App background |
| card | #1A1A1A | Card backgrounds, panels |
| cardLight | #242424 | Nested elements, inputs |
| border | #2C2C2C | All borders and dividers |
| textWhite | #FFFFFF | Primary text |
| textGray | #A0A0A0 | Secondary text |
| textMuted | #606060 | Placeholders, timestamps |
| success | #27AE60 | Available badge, cash, change |
| warning | #F39C12 | Warning states |
| danger | #C0392B | Delete actions, errors |
| overlay | rgba(0,0,0,0.75) | Modal backdrops |

---

### Typography
| Token | Size | Usage |
|---|---|---|
| xs | 11px | Labels, timestamps, badges |
| sm | 13px | Body text, table rows |
| md | 15px | Subheadings, card titles |
| lg | 18px | Page titles, stat values |
| xl | 22px | Large stat values |
| xxl | 28px | Hero numbers |

---

### Tailwind Config Extensions
```js
colors: {
  primary: "#C0392B",
  primaryDark: "#96281B",
  primaryLight: "#E74C3C",
  dark: "#0A0A0A",
  card: "#1A1A1A",
  cardLight: "#242424",
  border: "#2C2C2C",
  success: "#27AE60",
  warning: "#F39C12",
  danger: "#C0392B",
}
```

---

### Component Patterns

#### Buttons
- **Primary:** `bg-primary hover:bg-primaryDark text-white rounded-lg px-4 py-2`
- **Secondary:** `bg-card border border-border text-textGray rounded-lg px-4 py-2`
- **Danger:** `bg-danger/10 border border-danger/30 text-danger rounded-lg`
- **Disabled:** `bg-cardLight text-textMuted cursor-not-allowed`

#### Cards
bg-card border border-border rounded-xl p-4

#### Inputs
bg-card border border-border rounded-lg px-3 py-2 text-white
placeholder:text-textMuted focus:border-primary outline-none

#### Badges
- **Available:** `bg-success/15 text-success border border-success/30`
- **Unavailable:** `bg-textMuted/15 text-textMuted border border-textMuted/30`
- **Cash:** `bg-success/15 text-success border border-success/30`
- **GCash:** `bg-blue-500/15 text-blue-400 border border-blue-500/30`
- **Category:** `bg-cardLight text-textGray border border-border`

#### Modals
- Backdrop: `bg-black/75 fixed inset-0 flex items-center justify-center`
- Card: `bg-card border border-border rounded-2xl w-[520px]`
- Header: `border-b border-border p-4 flex justify-between`
- Footer: `border-t border-border p-4 flex justify-end gap-3`

---

### Layout Rules

#### Desktop App (Tauri)
- Full window width, no max-width
- Cashier view: menu panel (flex-1) + order panel (w-[300px])
- Owner view: sidebar (w-[200px]) + content (flex-1, max-w-[960px])
- Topbar: fixed h-[52px]

#### Client Web App (Phone/Tablet)
- Full viewport width
- Mobile-first layout
- Bottom navigation tabs
- Touch-friendly tap targets (min 44px)
- Larger font sizes for readability

---

### Screen-specific Wireframe Notes

#### Cashier Order Screen (Desktop)
- Topbar: brand name + role label + logout button
- Category tabs: horizontal scroll below topbar
- Menu grid: 4 columns, item cards with photo + name + price + add button
- Order panel (right): current order list with − qty + controls,
  × remove, discard button, payment selector, cash input, confirm button
- Unavailable items: grayed out overlay, disabled add button

#### Queue Screen (Desktop + Client)
- 3-column card grid on desktop, 1-column on mobile
- Each card: order number (red), timestamp, item list, total, payment badge
- Mark as Done button: full width, red
- Empty state: friendly message when no pending orders

#### Owner Login
- Centered card, max-w-[360px]
- Username + password fields
- Show/hide password toggle
- Error message row (always occupies space)
- Back to cashier link

#### Owner Dashboard
- Sidebar navigation (left)
- Period filter: Today / This Week / This Month
- 4 stat cards: Total Sales, Total Orders, Cash Sales, GCash Sales
- Sales bar chart (last 7 days, Recharts)
- Best sellers list (gold #1 rank)

#### Menu Management
- Search bar + category filter tabs
- Table: thumbnail, name, description, category, price, availability, actions
- Add item button (top right, red)
- Edit → modal form
- Delete → confirm dialog

#### Add/Edit Item Modal
- Item photo upload (Tauri file dialog on desktop, input file on web)
- Name (required), Price (required), Description (optional)
- Dynamic category pills with add/remove
- Availability toggle (Available / Unavailable)

#### Order History
- Period filter tabs
- Summary bar: total orders, revenue, cash, GCash
- Expandable table rows showing order items

---

### Design Rules
1. Never use pure white backgrounds — always dark
2. Red accent used sparingly — primary actions and prices only
3. All borders: #2C2C2C — no random border colors
4. Hover states: slightly lighter background (cardLight)
5. Active/selected: primary red background or border
6. Empty states: centered, emoji, muted text
7. Loading: subtle spinner in primary red
8. Error messages: red text, small, below the field
9. Success feedback: brief green toast notification
10. Destructive actions always require confirmation dialog
11. All modals have a dark overlay backdrop
12. Images in menu cards: object-cover, aspect-square
13. Missing images: gray placeholder with food icon