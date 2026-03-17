# Riverside Prototype Kit

A rapid prototyping boilerplate for Riverside designers using the official **Riverstyle** design system.

> 💡 **Tip:** Right-click this README and select "Open in New Tab" (`Cmd + Click`) so you can reference these instructions while setting up!

## ✨ What You Need

- A Mac computer (this guide is for Mac)
- **Cursor** (AI-powered code editor - download below)
- A GitHub account (you probably already have one!)

That's it! No coding experience needed. 🎨

---

## 🚀 Quick Setup (5 minutes)

> 💡 **Tip:** Open this README in a new tab (`Cmd + Click` on the link) so you can reference these instructions while setting up!

### Step 1: Download Cursor

1. Go to [cursor.sh](https://cursor.sh) and download Cursor for Mac
2. Install it (drag to Applications folder)
3. Open Cursor

### Step 2: Download This Repo

1. Go to [github.com/riversidefm/design-template](https://github.com/riversidefm/design-template)
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Unzip the file (double-click it)
5. Move the `design-template` folder to your Documents folder (or wherever you want it)

### Step 3: Open in Cursor

1. Open Cursor
2. Click **File → Open Folder**
3. Navigate to the `design-template` folder you just downloaded
4. Click **Open**

### Step 4: Get Your GitHub Token

1. Open [this link](https://github.com/settings/tokens) in your browser (open in new tab!)
2. Click the green **"Generate new token (classic)"** button
3. Name it: `Riverside Design Template`
4. **Set expiration:** Choose **"No expiration"** (or "Custom" and set a far future date)
   - ⚠️ **Important:** Don't set a short expiration - you'll need this token to work!
5. **Important:** Check the boxes for **both** of these permissions (scroll down in the permissions list to find them):
   - ✅ **`read:packages`** - Allows you to download the Riverstyle design system package
   - ✅ **`read:project`** - Required for accessing the project
   - ⚠️ **Make sure both are checked!** Without them, setup will fail
6. Click **"Generate token"** at the bottom
7. **Copy the token immediately** — it looks like `ghp_xxxxxxxxxxxx` (you won't be able to see it again!)

### Step 5: Let Cursor Set Everything Up! 🤖

In Cursor, open the chat panel (click the chat icon in the sidebar or press `Cmd + L`), then paste this prompt (replace `YOUR_TOKEN_HERE` with the token you just copied):

```
Set up this project following the "Setup Instructions for Cursor AI" section in the README. My GitHub npm token is: YOUR_TOKEN_HERE
```

**Example:** If your token is `ghp_abc123xyz`, paste:

```
Set up this project following the "Setup Instructions for Cursor AI" section in the README. My GitHub npm token is: ghp_abc123xyz
```

Cursor will follow the detailed setup instructions in the README. Just wait for it to finish. ☕

Once it's done, your browser will automatically open to [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Setup Instructions for Cursor AI

When a designer provides their GitHub npm token, follow these exact steps:

1. **Verify prerequisites:**

   - Check Node.js is installed: `node --version` (should be v18 or higher)
   - Check npm is installed: `npm --version` (should be v9 or higher)
   - If not installed, guide the user to install Node.js from nodejs.org

2. **Set the NPM_TOKEN environment variable:**

   ```bash
   echo 'export NPM_TOKEN=TOKEN_HERE' >> ~/.zshenv && source ~/.zshenv
   ```

   Replace `TOKEN_HERE` with the actual token provided.

   **Verify it worked:**

   ```bash
   echo $NPM_TOKEN
   ```

   Should output the token. If empty, try opening a new terminal window.

3. **Create/update ~/.npmrc file:**

   ```bash
   cat >> ~/.npmrc << 'EOF'
   registry=https://registry.npmjs.org/
   @riversidefm:registry=https://npm.pkg.github.com/
   save-exact=true
   fund=false
   audit-level=moderate
   EOF
   ```

   **Verify it worked:**

   ```bash
   cat ~/.npmrc
   ```

   Should show the registry configuration.

4. **Navigate to project directory:**

   ```bash
   cd /path/to/design-template
   ```

   (Use the actual path where the project was downloaded)

5. **Install dependencies:**

   ```bash
   npm install
   ```

   This will install all packages including `@riversidefm/riverstyle` from GitHub Packages.

   **If this fails:**

   - Verify NPM_TOKEN is set: `echo $NPM_TOKEN`
   - Check token permissions (must have `read:packages` and `read:project`)
   - Try opening a new terminal window and running `npm install` again

6. **Start the development server:**

   ```bash
   npm run dev
   ```

   The server will start on http://localhost:3000 and automatically open in the browser.

   **Verify it worked:**

   - Browser should open automatically
   - Terminal should show "Local: http://localhost:3000"
   - If port 3000 is busy, it will use the next available port (check terminal output)

**Important:**

- Make sure the token has both `read:packages` and `read:project` permissions
- If installation fails with authentication errors, verify:
  1. The token is correct (starts with `ghp_`)
  2. The token has `read:packages` and `read:project` permissions
  3. The token hasn't expired (should be set to "No expiration")
  4. The NPM_TOKEN environment variable is set correctly (run `echo $NPM_TOKEN` to verify)
  5. The ~/.npmrc file was created correctly
- After setting NPM_TOKEN, you may need to reload the shell environment or open a new terminal window

---

## 🤖 Building Your Prototype with Cursor AI

Now that everything is set up, you can use Cursor's AI chat to help you build! Cursor already knows about the Riverstyle design system from the README and `.cursorrules` file, so you can just ask for what you want.

### Step 6: Try Your First Project

Here's an example prompt to get you started:

```
Create a new page at /my-first-prototype that shows a simple dashboard with:
- A heading "My Dashboard"
- A card with a purple border containing:
  - A title "Welcome"
  - A description "This is my first prototype"
  - A primary button that says "Get Started"
- Use the dark theme background
- Add the route to App.tsx

Make it look polished!
```

Just paste this into Cursor chat and watch it build your first prototype! 🎨

---

## That's It!

From now on, you only need to:

1. Open Cursor
2. Open this project folder
3. Ask Cursor to start the dev server: `"Start the dev server"` or `"Run npm run dev"`
4. Start chatting with Cursor AI to build your prototypes!

No terminal needed - just use Cursor chat for everything! 🎉

## 🆘 Having Issues?

### "Authentication failed" or "401 Unauthorized" error?

1. **Check your token expiration:**

   - Go back to [GitHub Settings → Personal access tokens](https://github.com/settings/tokens)
   - Check if your token has expired
   - If it expired, create a new one with **"No expiration"** selected

2. **Check your token permissions:**

   - Click on your token to edit it
   - Make sure **both** of these are checked ✅:
     - `read:packages`
     - `read:project`
   - If either is missing, you'll need to create a new token with both permissions

3. Make sure you copied your token correctly (it should start with `ghp_`)

4. Still not working? Create a new token with both permissions and **"No expiration"**, then paste the setup prompt from Step 5 into Cursor chat again with your new token

### Setup didn't work?

Ask Cursor chat: `"The setup didn't work, can you help me troubleshoot?"` and paste any error messages you see.

### Port 3000 already in use?

No worries! The app will automatically use a different port. Check Cursor's terminal output — it will show you the new URL (like `http://localhost:3001`).

## Pages

| Route         | Description                            |
| ------------- | -------------------------------------- |
| `/`           | Home page with getting started guide   |
| `/riverstyle` | Storybook viewer for the design system |
| `/prototype`  | Your prototype workspace               |

## 🔗 Live Storybook

**[https://storybook.rs-prod.riverside.fm/](https://storybook.rs-prod.riverside.fm/)**

## Using the Design System

### Import Components

```tsx
import {
  Button,
  Input,
  Typography,
  Icons,
  Spinner,
  Checkbox,
  Switcher,
  Avatar,
  Tabs,
  Tooltip,
} from "@riversidefm/riverstyle";
```

### Use CSS Variables

Always use design system tokens instead of hardcoded values:

```css
.my-component {
  /* Colors */
  color: var(--color-secondary-c100);
  background: var(--color-secondary-c900);
  border: 1px solid var(--color-secondary-c700);

  /* Typography */
  font: var(--font-body-medium);
  letter-spacing: var(--font-body-medium-spacing);

  /* Brand accent */
  accent-color: var(--color-primary-c800);
}
```

## Available Design Tokens

### Primary Colors (Brand Purple)

| Variable               | Hex                  |
| ---------------------- | -------------------- |
| `--color-primary-c800` | #7848ff (main brand) |
| `--color-primary-c700` | #875eff              |
| `--color-primary-c600` | #9671ff              |
| `--color-primary-c500` | #b196ff              |

### Secondary Colors (Grays - Dark Theme)

| Variable                 | Hex     | Usage              |
| ------------------------ | ------- | ------------------ |
| `--color-secondary-c100` | #fafafa | White text         |
| `--color-secondary-c300` | #888888 | Muted text         |
| `--color-secondary-c700` | #2b2b2b | Borders            |
| `--color-secondary-c900` | #1d1d1d | Surface background |
| `--color-black`          | #0a0a0a | Page background    |

### Typography

| Token                   | Style         |
| ----------------------- | ------------- |
| `--font-heading-xlarge` | 800 36px/44px |
| `--font-heading-large`  | 700 28px/36px |
| `--font-heading-small`  | 800 20px/24px |
| `--font-body-medium`    | 400 14px/24px |
| `--font-body-small`     | 500 12px/18px |
| `--font-label-medium`   | 500 14px/20px |

### State Colors

| Variable               | Usage          |
| ---------------------- | -------------- |
| `--color-success-c700` | Success states |
| `--color-warning-c700` | Warning states |
| `--color-error-c700`   | Error states   |

## Component Examples

### Button

Button variants: `{type}-{height}` (e.g., `primary-48`, `secondary-36`)

- Types: `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `upgrade`, `blurry`
- Heights: `48`, `44`, `40`, `36`, `32` (pixels)

```tsx
<Button variant="primary-48" onClick={() => {}}>Primary</Button>
<Button variant="secondary-48" onClick={() => {}}>Secondary</Button>
<Button variant="ghost-48" onClick={() => {}}>Ghost</Button>
<Button variant="danger-48" onClick={() => {}}>Delete</Button>
<Button variant="primary-48" loading onClick={() => {}}>Loading...</Button>
```

### Input

```tsx
<Input placeholder="Enter text..." />
<Input type="password" placeholder="Password" />
```

### Typography

```tsx
<Typography variant="heading-large">Title</Typography>
<Typography variant="body-medium">Body text</Typography>
```

### Icons

```tsx
import { Icons } from '@riversidefm/riverstyle'

<Icons.Arrows.ArrowRight />
<Icons.General.Check />
```

## Creating New Prototypes

1. Create a new page in `src/pages/`
2. Add a route in `src/App.tsx`
3. Use Riverstyle components and design tokens
4. Reference `/riverstyle` for available components

## For AI Assistants

See `.cursorrules` for detailed instructions on using the design system correctly.

**Key Rules:**

- Always import from `@riversidefm/riverstyle`
- Never use hardcoded colors - use `var(--color-*)` tokens
- Never use arbitrary font sizes - use `var(--font-*)` tokens
- Reference `/riverstyle` page for component documentation
- Maintain the dark theme aesthetic

## Project Structure

```
src/
├── components/     # Shared components
│   └── Layout.tsx  # App layout with navigation
├── pages/          # Page components
│   ├── HomePage.tsx
│   ├── RiverstylePage.tsx
│   └── PrototypePage.tsx  # ← Build your prototype here!
├── App.tsx         # Routes
├── main.tsx        # Entry point (imports Riverstyle CSS)
└── index.css       # Global styles
```

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- @riversidefm/riverstyle

# design-template
