/**
 * MY COMPONENTS PAGE
 * 
 * Showcase custom components that don't exist in Riverstyle.
 * Add your custom components here to preview them.
 */

import { useState } from 'react'
import { Typography, Button } from '@riversidefm/riverstyle'
import { Link } from 'react-router-dom'

// Import your custom components here
import { PlatformSidebar } from '../components/my-components'

export function MyComponentsPage() {
  const [sidebarActiveNav, setSidebarActiveNav] = useState('home')
  
  return (
    <div className="my-components-page">
      <header className="page-header">
        <Typography variant="headingLarge">My Custom Components</Typography>
        <Typography variant="bodyMedium" color="secondary.c300">
          Custom components built following the Riverstyle design system
        </Typography>
      </header>

      <section className="info-section">
        <div className="info-card">
          <Typography variant="headingSmall" style={{ marginBottom: '12px' }}>
            📋 Before Creating Custom Components
          </Typography>
          <ul className="checklist">
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                1. Check if it exists in{' '}
                <a href="https://storybook.rs-prod.riverside.fm/" target="_blank" rel="noopener noreferrer">
                  Riverstyle Storybook
                </a>
              </Typography>
            </li>
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                2. Check if you can compose it from existing components
              </Typography>
            </li>
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                3. Only create custom components as a last resort
              </Typography>
            </li>
          </ul>
        </div>

        <div className="info-card">
          <Typography variant="headingSmall" style={{ marginBottom: '12px' }}>
            🎨 Design System Rules for Custom Components
          </Typography>
          <ul className="checklist">
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                ✅ Use <code>var(--color-*)</code> tokens for all colors
              </Typography>
            </li>
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                ✅ Use <code>var(--font-*)</code> tokens for typography
              </Typography>
            </li>
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                ✅ Use Riverstyle Icons from <code>@riversidefm/riverstyle</code>
              </Typography>
            </li>
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                ✅ Follow dark theme aesthetic (secondary-c900+ backgrounds)
              </Typography>
            </li>
            <li>
              <Typography variant="bodySmall" color="secondary.c200">
                ✅ Use primary-c800 (#7848ff) for brand accents
              </Typography>
            </li>
          </ul>
        </div>
      </section>

      <section className="components-section">
        <Typography variant="headingSmall" style={{ marginBottom: '16px' }}>
          Your Custom Components
        </Typography>
        
        {/* PlatformSidebar Component */}
        <div className="component-showcase">
          <div className="component-header">
            <Typography variant="labelMedium" color="secondary.c400">PlatformSidebar</Typography>
            <Link to="/dashboard">
              <Button variant="ghost-32" onClick={() => {}}>
                View in Platform →
              </Button>
            </Link>
          </div>
          <Typography variant="bodySmall" color="secondary.c300" style={{ marginBottom: '12px' }}>
            Main sidebar navigation component for platform screens. Based on Figma design.
          </Typography>
          <div className="component-demo sidebar-demo">
            <PlatformSidebar 
              activeNavId={sidebarActiveNav}
              onNavChange={setSidebarActiveNav}
            />
          </div>
          <code className="code-snippet">{`<PlatformSidebar 
  activeNavId={activeNav}
  onNavChange={setActiveNav}
  studioThumbnail="/my-studio.png"
  studioLabel="My Studio"
/>`}</code>
        </div>
      </section>

      <style>{`
        .my-components-page {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .page-header {
          text-align: center;
          padding-bottom: 32px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--color-secondary-c700);
        }
        
        .info-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        
        .info-card {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 20px;
        }
        
        .checklist {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .checklist a {
          color: var(--color-primary-c600);
          text-decoration: none;
        }
        
        .checklist a:hover {
          text-decoration: underline;
        }
        
        .checklist code {
          background: var(--color-transparent-p10);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 11px;
          color: var(--color-primary-c500);
        }
        
        .components-section {
          padding-top: 24px;
          border-top: 1px solid var(--color-secondary-c700);
        }
        
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          background: var(--color-secondary-c1000);
          border: 2px dashed var(--color-secondary-c600);
          border-radius: 16px;
        }
        
        .empty-state code {
          background: var(--color-transparent-p10);
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 12px;
          color: var(--color-primary-c500);
        }
        
        .component-showcase {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .component-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .component-demo {
          padding: 20px;
          background: var(--color-secondary-c1000);
          border-radius: 8px;
          margin: 12px 0;
        }
        
        .sidebar-demo {
          padding: 0;
          background: var(--color-secondary-c1100);
          height: 500px;
          overflow: hidden;
          display: flex;
        }
        
        .code-snippet {
          display: block;
          background: var(--color-black);
          padding: 12px;
          border-radius: 8px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 12px;
          color: var(--color-primary-c400);
        }
      `}</style>
    </div>
  )
}

