# Riverstyle Design System Reference

> **⚠️ AI ASSISTANTS: READ THIS FIRST**
>
> When working on this codebase, **prioritize** using the `@riversidefm/riverstyle` design system.
> Always check for existing components, icons, colors, and typography tokens FIRST.
>
> **Priority Order:**
>
> 1. Use Riverstyle components/icons/tokens if they exist
> 2. Compose from existing Riverstyle elements if possible
> 3. Create custom elements only when necessary (using design tokens)
>
> **🔍 ICONS: Always Check the Icon Set First!**
> Most icons exist in `node_modules/@riversidefm/riverstyle/icons/`
> Look up the file name and convert: `home-05.svg.js` → `Icons.General.Home05`

## 🔗 Live Storybook

**[Open Storybook](https://storybook.rs-prod.riverside.fm/)**

## Installation

The design system is already installed. CSS is imported in `src/main.tsx`:

```tsx
import "@riversidefm/riverstyle/styles.css";
```

## Component Library

Import components from the package:

```tsx
import {
  // Buttons
  Button,
  LinkButton,
  IconButton,

  // Form Controls
  Input,
  InputField,
  Checkbox,
  Switcher,
  DefaultSelect,

  // Feedback
  Toast,
  Tooltip,
  TooltipIcon,
  Popover,
  Spinner,

  // Display
  Avatar,
  Typography,
  Tabs,

  // Utilities
  Portal,
  usePortalContainer,
  useBreakpoint,
  useKeyboard,
  useClickOutside,

  // Icons
  Icons,
} from "@riversidefm/riverstyle";
```

## Button Component

Button variants combine type and height: `{type}-{height}`

**Types:** `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `upgrade`, `blurry`
**Heights:** `48`, `44`, `40`, `36`, `32` (pixels)

```tsx
// Standard buttons (48px height)
<Button variant="primary-48" onClick={() => {}}>Primary</Button>
<Button variant="secondary-48" onClick={() => {}}>Secondary</Button>
<Button variant="tertiary-48" onClick={() => {}}>Tertiary</Button>
<Button variant="ghost-48" onClick={() => {}}>Ghost</Button>

// Smaller sizes
<Button variant="primary-40" onClick={() => {}}>Medium</Button>
<Button variant="primary-36" onClick={() => {}}>Small</Button>
<Button variant="primary-32" onClick={() => {}}>Tiny</Button>

// Special variants
<Button variant="danger-48" onClick={() => {}}>Danger</Button>
<Button variant="upgrade-48" onClick={() => {}}>Upgrade</Button>
<Button variant="blurry-48" onClick={() => {}}>Blurry</Button>

// States
<Button variant="primary-48" disabled onClick={() => {}}>Disabled</Button>
<Button variant="primary-48" loading onClick={() => {}}>Loading</Button>
```

## Input Component

```tsx
<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input error="This field is required" />
<Input disabled />

// With label using InputField (requires props objects)
<InputField
  inputProps={{ placeholder: "you@example.com", type: "email" }}
  labelProps={{ label: "Email Address" }}
  errorProps={{ message: "" }}
/>
```

## Typography Component

```tsx
<Typography variant="heading-xlarge">Hero Title</Typography>
<Typography variant="heading-large">Page Title</Typography>
<Typography variant="heading-medium">Section Title</Typography>
<Typography variant="heading-small">Card Title</Typography>
<Typography variant="body-large">Large body text</Typography>
<Typography variant="body-medium">Normal body text</Typography>
<Typography variant="body-small">Small body text</Typography>
<Typography variant="label-medium">Label</Typography>
```

## Icons

> ⚠️ **Always check the Riverstyle icon set first!** Most icons you need already exist.
>
> **If an icon doesn't exist:** Download it from Figma using the MCP tool - NEVER create SVGs manually!

Icons are from [Untitled UI Icons](https://www.untitledui.com/icons) plus custom Riverside icons.

### How to Find Icons

**Step 1:** Browse the icon files in `node_modules/@riversidefm/riverstyle/icons/`

```bash
# List all icon categories
ls node_modules/@riversidefm/riverstyle/icons/

# List icons in a specific category
ls node_modules/@riversidefm/riverstyle/icons/general/
ls node_modules/@riversidefm/riverstyle/icons/files/
ls node_modules/@riversidefm/riverstyle/icons/media-devices/
```

**Step 2:** Convert file name to component name:

| File Name               | Component Name                     |
| ----------------------- | ---------------------------------- |
| `home-05.svg.js`        | `Icons.General.Home05`             |
| `user-plus-01.svg.js`   | `Icons.Users.UserPlus01`           |
| `video-recorder.svg.js` | `Icons.MediaDevices.VideoRecorder` |
| `search-md.svg.js`      | `Icons.General.SearchMd`           |
| `help-circle.svg.js`    | `Icons.General.HelpCircle`         |
| `folder.svg.js`         | `Icons.Files.Folder`               |
| `calendar.svg.js`       | `Icons.Time.Calendar`              |
| `podcast.svg.js`        | `Icons.MediaDevices.Podcast`       |

**Naming Rules:**

- Kebab-case → PascalCase: `arrow-right` → `ArrowRight`
- Numbers stay at end: `settings-01` → `Settings01`
- Folder name = Category: `/general/` → `Icons.General.*`

### Usage Examples

```tsx
import { Icons } from '@riversidefm/riverstyle'

// General icons (from /icons/general/)
<Icons.General.Home05 style={{ width: 24, height: 24 }} />
<Icons.General.Settings01 style={{ width: 24, height: 24 }} />
<Icons.General.Settings02 style={{ width: 24, height: 24 }} />
<Icons.General.Plus style={{ width: 24, height: 24 }} />
<Icons.General.Check style={{ width: 24, height: 24 }} />
<Icons.General.XClose style={{ width: 24, height: 24 }} />
<Icons.General.SearchMd style={{ width: 24, height: 24 }} />
<Icons.General.HelpCircle style={{ width: 24, height: 24 }} />

// Files icons (from /icons/files/)
<Icons.Files.Folder style={{ width: 24, height: 24 }} />
<Icons.Files.File01 style={{ width: 24, height: 24 }} />

// Time icons (from /icons/time/)
<Icons.Time.Calendar style={{ width: 24, height: 24 }} />
<Icons.Time.Clock style={{ width: 24, height: 24 }} />

// Users icons (from /icons/users/)
<Icons.Users.UserPlus01 style={{ width: 24, height: 24 }} />
<Icons.Users.User01 style={{ width: 24, height: 24 }} />

// MediaDevices icons (from /icons/media-devices/)
<Icons.MediaDevices.Podcast style={{ width: 24, height: 24 }} />
<Icons.MediaDevices.VideoRecorder style={{ width: 24, height: 24 }} />
<Icons.MediaDevices.Microphone01 style={{ width: 24, height: 24 }} />

// Arrows icons (from /icons/arrows/)
<Icons.Arrows.ArrowRight style={{ width: 24, height: 24 }} />
<Icons.Arrows.ChevronDown style={{ width: 24, height: 24 }} />

// AlertsFeedback icons (from /icons/alerts-feedback/)
<Icons.AlertsFeedback.Announcement01 style={{ width: 24, height: 24 }} />
<Icons.AlertsFeedback.Bell01 style={{ width: 24, height: 24 }} />

// Styling with color
<Icons.General.Settings01
  style={{
    width: 16,
    height: 16,
    color: 'var(--color-secondary-c400)'
  }}
/>
```

### Icon Categories

| Category         | Folder Path               | Common Icons                                                                                             |
| ---------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `General`        | `/icons/general/`         | Home05, Settings01, Settings02, Plus, Check, XClose, SearchMd, HelpCircle, Edit01, Trash01, Eye, EyeOff  |
| `Arrows`         | `/icons/arrows/`          | ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight             |
| `AlertsFeedback` | `/icons/alerts-feedback/` | Announcement01, Bell01, Bell02, AlertCircle, AlertTriangle, InfoCircle, ThumbsUp, ThumbsDown             |
| `Files`          | `/icons/files/`           | Folder, FolderPlus, File01, File02, FileText, Clipboard, Paperclip                                       |
| `Time`           | `/icons/time/`            | Calendar, CalendarPlus01, Clock, ClockCheck, AlarmClock, Hourglass01                                     |
| `Users`          | `/icons/users/`           | User01, User02, UserPlus01, UserMinus01, UserCheck01, Users01, FaceSmile                                 |
| `MediaDevices`   | `/icons/media-devices/`   | Podcast, VideoRecorder, VideoRecorderOff, Microphone01, Microphone02, MicrophoneOff01, Play, Pause, Stop |
| `Communications` | `/icons/communications/`  | Mail01, Mail02, Phone, PhoneCall, MessageSquare, MessageCircle                                           |
| `Editor`         | `/icons/editor/`          | Bold, Italic, Underline, AlignLeft, AlignCenter                                                          |
| `Magic`          | `/icons/magic/`           | MagicClips, MagicCaptions, SmartLayouts, CoCreator, AiTranslate                                          |
| `Riverside`      | `/icons/riverside/`       | Webinar                                                                                                  |

### Quick Reference: Common Icon Mappings

For sidebar/navigation icons commonly used in Riverside:

```tsx
// Navigation
<Icons.General.Home05 />        // Home
<Icons.Files.Folder />          // Projects
<Icons.Time.Calendar />         // Schedule
<Icons.MediaDevices.Podcast />  // Hosting/Podcast

// Actions
<Icons.Users.UserPlus01 />           // Invite
<Icons.MediaDevices.VideoRecorder /> // Record
<Icons.General.Settings02 />         // Settings
<Icons.General.HelpCircle />         // Help

// Search
<Icons.General.SearchMd />      // Medium search icon
<Icons.General.SearchLg />      // Large search icon
```

### If Icon Doesn't Exist - Download from Figma

**⚠️ NEVER create custom SVG icons by hand!** If an icon doesn't exist in Riverstyle after checking all categories:

1. **Get the node ID** from the Figma design URL or layer panel
2. **Use the Figma MCP tool** to download the exact SVG:

```
mcp_Figma_Desktop_get_design_context({
  nodeId: "1234:5678",
  dirForAssetWrites: "/absolute/path/to/project/public/icons"
})
```

3. **Use the downloaded SVG** in your component:

```tsx
// SVG downloaded from Figma to /public/icons/
const customIconPath = '/icons/abc123def456.svg'

// Reference in your component
<img src={customIconPath} alt="" style={{ width: 20, height: 20 }} />
```

This ensures the icon is pixel-perfect with the Figma design instead of a manual recreation.

## CSS Variables Reference

### Color Tokens

#### Primary Colors (Purple Brand)

| Variable               | Hex     | Usage                |
| ---------------------- | ------- | -------------------- |
| `--color-primary-c100` | #f2eeff | Light backgrounds    |
| `--color-primary-c200` | #e7dfff | Light accents        |
| `--color-primary-c300` | #d5c7ff | Hover states (light) |
| `--color-primary-c400` | #c3afff | Subtle accents       |
| `--color-primary-c500` | #b196ff | Medium accent        |
| `--color-primary-c600` | #9671ff | Secondary accent     |
| `--color-primary-c700` | #875eff | Strong accent        |
| `--color-primary-c800` | #7848ff | **Main brand color** |
| `--color-primary-c900` | #5e3ac3 | Dark accent          |

#### Secondary Colors (Grays - Dark Theme)

| Variable                  | Hex     | Usage              |
| ------------------------- | ------- | ------------------ |
| `--color-secondary-c100`  | #fafafa | White text         |
| `--color-secondary-c150`  | #dbdbdb | Bright text        |
| `--color-secondary-c200`  | #bbbbbb | Secondary text     |
| `--color-secondary-c300`  | #888888 | Muted text         |
| `--color-secondary-c400`  | #555555 | Disabled text      |
| `--color-secondary-c500`  | #444444 | Borders            |
| `--color-secondary-c600`  | #383838 | Light surface      |
| `--color-secondary-c700`  | #2b2b2b | Card borders       |
| `--color-secondary-c800`  | #222222 | Card background    |
| `--color-secondary-c900`  | #1d1d1d | Surface background |
| `--color-secondary-c1000` | #151515 | Deep background    |
| `--color-secondary-c1100` | #0d0d0d | Darkest background |

#### Base Colors

| Variable        | Hex     |
| --------------- | ------- |
| `--color-white` | #ffffff |
| `--color-black` | #0a0a0a |

#### State Colors

| Variable               | Hex     | Usage           |
| ---------------------- | ------- | --------------- |
| `--color-success-c500` | #a0e2bc | Success light   |
| `--color-success-c600` | #6fcf97 | Success medium  |
| `--color-success-c700` | #27ae60 | Success default |
| `--color-success-c800` | #1b9850 | Success dark    |
| `--color-warning-c500` | #ffeaaf | Warning light   |
| `--color-warning-c600` | #ffe184 | Warning medium  |
| `--color-warning-c700` | #f2c94c | Warning default |
| `--color-warning-c800` | #e3b21b | Warning dark    |
| `--color-error-c400`   | #ff9999 | Error lightest  |
| `--color-error-c500`   | #f27070 | Error light     |
| `--color-error-c600`   | #f25757 | Error medium    |
| `--color-error-c700`   | #e04040 | Error default   |
| `--color-error-c800`   | #c92f2f | Error dark      |

#### Accent Colors

| Variable               | Hex     |
| ---------------------- | ------- |
| `--color-purple`       | #b43dff |
| `--color-light-purple` | #b377ff |
| `--color-pink`         | #e961ff |
| `--color-dark-blue`    | #5353fc |
| `--color-light-blue`   | #50c9ff |
| `--color-green`        | #67ffb1 |
| `--color-neon`         | #c2ff44 |
| `--color-yellow`       | #ffec45 |
| `--color-orange`       | #ff8a00 |

### Typography Tokens

#### Font Family

```css
font-family: var(--font-family-main); /* Inter, sans-serif */
```

#### Headings

| Token                    | Style         |
| ------------------------ | ------------- |
| `--font-heading-xlarge`  | 800 36px/44px |
| `--font-heading-large`   | 700 28px/36px |
| `--font-heading-medium`  | 800 24px/20px |
| `--font-heading-small`   | 800 20px/24px |
| `--font-heading-xsmall`  | 800 16px/24px |
| `--font-heading-xxsmall` | 700 14px/20px |

#### Body

| Token                | Style         |
| -------------------- | ------------- |
| `--font-body-xlarge` | 500 20px/28px |
| `--font-body-large`  | 500 16px/24px |
| `--font-body-medium` | 400 14px/24px |
| `--font-body-small`  | 500 12px/18px |

#### Labels & Links

| Token                 | Style         |
| --------------------- | ------------- |
| `--font-label-medium` | 500 14px/20px |
| `--font-label-small`  | 600 12px/20px |
| `--font-link-medium`  | 600 14px/20px |
| `--font-link-small`   | 700 12px/20px |
| `--font-helper`       | 500 11px/20px |
| `--font-tip`          | 600 11px/16px |
| `--font-tiny-label`   | 500 10px/16px |

Each font token has a matching `-spacing` token:

```css
font: var(--font-heading-large);
letter-spacing: var(--font-heading-large-spacing);
```

## Styling Examples

### Dark Card Pattern

```tsx
<div
  style={{
    background: "var(--color-secondary-c900)",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid var(--color-secondary-c700)",
  }}
>
  <Typography variant="heading-small" style={{ marginBottom: "8px" }}>
    Card Title
  </Typography>
  <Typography
    variant="body-medium"
    style={{ color: "var(--color-secondary-c300)" }}
  >
    Card description text goes here
  </Typography>
</div>
```

### Form Layout

```tsx
<form
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }}
>
  <InputField
    inputProps={{ placeholder: "you@example.com", type: "email" }}
    labelProps={{ label: "Email" }}
    errorProps={{ message: "" }}
  />
  <InputField
    inputProps={{ placeholder: "Password", type: "password" }}
    labelProps={{ label: "Password" }}
    errorProps={{ message: "" }}
  />
  <Button variant="primary" type="submit">
    Sign In
  </Button>
</form>
```

### Page Background

```tsx
<div
  style={{
    minHeight: "100vh",
    background: "var(--color-black)",
    color: "var(--color-secondary-c100)",
    padding: "32px",
  }}
>
  {/* Content */}
</div>
```

## Reference Pages

- **Local Storybook:** `/riverstyle` route in this app
- **Production Storybook:** https://storybook.rs-prod.riverside.fm/
