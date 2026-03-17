/**
 * CUSTOM COMPONENT TEMPLATE
 * 
 * Copy this file to create a new custom component.
 * Rename to YourComponentName.tsx
 * 
 * CHECKLIST before creating:
 * ☐ Component does NOT exist in Riverstyle (checked Storybook)
 * ☐ Cannot be composed from existing Riverstyle components
 * ☐ Using Riverstyle CSS variables for colors
 * ☐ Using Riverstyle typography tokens
 * ☐ Following dark theme aesthetic
 */

import { Typography } from '@riversidefm/riverstyle'

interface MyComponentProps {
  // Define your props here
  title: string
  children?: React.ReactNode
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div
      style={{
        // ✅ Use Riverstyle color tokens
        background: 'var(--color-secondary-c900)',
        border: '1px solid var(--color-secondary-c700)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      {/* ✅ Use Typography component */}
      <Typography variant="headingSmall" style={{ marginBottom: '8px' }}>
        {title}
      </Typography>
      
      <div
        style={{
          // ✅ Use color tokens for text
          color: 'var(--color-secondary-c300)',
          // ✅ Use font tokens
          font: 'var(--font-body-medium)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Don't forget to export from index.ts!

