/**
 * HOME PAGE
 * Getting started guide for designers using this prototype
 * 
 * AI INSTRUCTIONS:
 * When modifying this page or creating new pages, always use:
 * - Components from @riversidefm/riverstyle
 * - CSS variables from the design system (--color-*, --font-*)
 */

import { Typography, Button, Icons } from '@riversidefm/riverstyle'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="home-page">
      <header className="hero">
        <div className="hero-badge">
          <Icons.General.Zap style={{ width: 16, height: 16 }} />
          <span>AI-Powered Prototyping</span>
        </div>
        <Typography variant="headingXLarge" style={{ marginBottom: '16px' }}>
          <span className="gradient-text">Riverside Design Toolkit</span>
        </Typography>
        <Typography variant="bodyLarge" style={{ color: 'var(--color-secondary-c300)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Prototype Riverside features quickly using AI. This repo is pre-configured with our design system, 
          Figma integration, and Cursor rules — just describe what you want to build.
        </Typography>
      </header>

      {/* What is this? */}
      <section className="info-section">
        <div className="section-header">
          <div className="section-icon">
            <Icons.General.HelpCircle style={{ width: 20, height: 20 }} />
          </div>
          <Typography variant="headingSmall">What is this?</Typography>
        </div>
        
        <div className="info-card">
          <Typography variant="bodyMedium" style={{ color: 'var(--color-secondary-c200)', lineHeight: '1.7' }}>
            This is a <strong>design prototyping environment</strong> that lets you build high-fidelity Riverside 
            mockups using AI assistance. It includes:
          </Typography>
          <ul className="feature-list">
            <li>
              <Icons.General.Check style={{ width: 16, height: 16, color: 'var(--color-success-c600)' }} />
              <span><strong>Riverstyle</strong> — Our full design system with colors, typography, and components</span>
            </li>
            <li>
              <Icons.General.Check style={{ width: 16, height: 16, color: 'var(--color-success-c600)' }} />
              <span><strong>Figma MCP</strong> — Directly translate Figma designs to code</span>
            </li>
            <li>
              <Icons.General.Check style={{ width: 16, height: 16, color: 'var(--color-success-c600)' }} />
              <span><strong>Cursor Rules</strong> — AI knows our design tokens and component APIs</span>
            </li>
            <li>
              <Icons.General.Check style={{ width: 16, height: 16, color: 'var(--color-success-c600)' }} />
              <span><strong>Example pages</strong> — Dashboard and project templates to start from</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How to Use */}
      <section className="info-section">
        <div className="section-header">
          <div className="section-icon">
            <Icons.General.ZapFast style={{ width: 20, height: 20 }} />
          </div>
          <Typography variant="headingSmall">How to Use</Typography>
        </div>
        
        <div className="workflow-grid">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <Typography variant="headingXXSmall" style={{ marginBottom: '8px' }}>
                Open in Cursor
              </Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c300)' }}>
                This repo works best with <strong>Cursor IDE</strong>. The AI has full context of our design system 
                through the <code>.cursorrules</code> file.
              </Typography>
            </div>
          </div>
          
          <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <Typography variant="headingXXSmall" style={{ marginBottom: '8px' }}>
                Describe Your UI
              </Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c300)' }}>
                Tell the AI what you want to build. You can reference Figma designs directly — 
                just paste a Figma URL and ask it to implement the design.
              </Typography>
            </div>
          </div>
          
          <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <Typography variant="headingXXSmall" style={{ marginBottom: '8px' }}>
                Iterate & Preview
              </Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c300)' }}>
                The dev server auto-reloads. Keep chatting with AI to refine the design. 
                Add interactions, animations, or new pages as needed.
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* Example Prompts */}
      <section className="info-section">
        <div className="section-header">
          <div className="section-icon">
            <Icons.Communications.MessageTextSquare01 style={{ width: 20, height: 20 }} />
          </div>
          <Typography variant="headingSmall">Example Prompts</Typography>
        </div>
        
        <div className="prompts-grid">
          <div className="prompt-card">
            <div className="prompt-label">From Figma</div>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c200)' }}>
              "Implement this Figma design: [paste Figma URL]"
            </Typography>
          </div>
          
          <div className="prompt-card">
            <div className="prompt-label">New Feature</div>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c200)' }}>
              "Create a project settings page with tabs for general, members, and billing"
            </Typography>
          </div>
          
          <div className="prompt-card">
            <div className="prompt-label">Component</div>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c200)' }}>
              "Build a recording card component showing duration, participants, and status"
            </Typography>
          </div>
          
          <div className="prompt-card">
            <div className="prompt-label">Interaction</div>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c200)' }}>
              "Add a confirmation modal when clicking delete, with cancel and confirm buttons"
            </Typography>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="info-section">
        <div className="section-header">
          <div className="section-icon">
            <Icons.General.Link01 style={{ width: 20, height: 20 }} />
          </div>
          <Typography variant="headingSmall">Quick Links</Typography>
        </div>
        
        <div className="links-grid">
          <Link to="/riverstyle" className="link-card">
            <div className="link-card-icon">
              <Icons.Education.BookOpen01 style={{ width: 24, height: 24 }} />
            </div>
            <div className="link-card-content">
              <Typography variant="headingXXSmall">Storybook</Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c400)' }}>
                Full Riverstyle documentation
              </Typography>
            </div>
            <Icons.Arrows.ArrowRight style={{ width: 20, height: 20, color: 'var(--color-secondary-c500)' }} />
          </Link>
          
          <Link to="/prototype" className="link-card">
            <div className="link-card-icon">
              <Icons.Development.PuzzlePiece style={{ width: 24, height: 24 }} />
            </div>
            <div className="link-card-content">
              <Typography variant="headingXXSmall">Components</Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c400)' }}>
                Component showcase & examples
              </Typography>
            </div>
            <Icons.Arrows.ArrowRight style={{ width: 20, height: 20, color: 'var(--color-secondary-c500)' }} />
          </Link>
          
          <Link to="/dashboard" className="link-card">
            <div className="link-card-icon">
              <Icons.Layout.LayoutAlt03 style={{ width: 24, height: 24 }} />
            </div>
            <div className="link-card-content">
              <Typography variant="headingXXSmall">Dashboard</Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c400)' }}>
                Example platform screen
              </Typography>
            </div>
            <Icons.Arrows.ArrowRight style={{ width: 20, height: 20, color: 'var(--color-secondary-c500)' }} />
          </Link>
          
          <a href="https://storybook.rs-prod.riverside.fm/" target="_blank" rel="noopener noreferrer" className="link-card">
            <div className="link-card-icon">
              <Icons.General.LinkExternal02 style={{ width: 24, height: 24 }} />
            </div>
            <div className="link-card-content">
              <Typography variant="headingXXSmall">Live Storybook</Typography>
              <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c400)' }}>
                storybook.rs-prod.riverside.fm
              </Typography>
            </div>
            <Icons.Arrows.ArrowRight style={{ width: 20, height: 20, color: 'var(--color-secondary-c500)' }} />
          </a>
        </div>
      </section>

      {/* File Structure */}
      <section className="info-section">
        <div className="section-header">
          <div className="section-icon">
            <Icons.Files.Folder style={{ width: 20, height: 20 }} />
          </div>
          <Typography variant="headingSmall">File Structure</Typography>
        </div>
        
        <div className="code-block">
          <pre><code>{`src/
├── pages/              ← Add your prototype pages here
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   └── ...
├── components/
│   └── my-components/  ← Custom components (only if needed)
└── App.tsx             ← Route configuration

.cursorrules            ← AI instructions & design system reference`}</code></pre>
        </div>
      </section>

      {/* Tips */}
      <section className="info-section tips-section">
        <div className="section-header">
          <div className="section-icon tip-icon">
            <Icons.AlertsFeedback.AlertCircle style={{ width: 20, height: 20 }} />
          </div>
          <Typography variant="headingSmall">Pro Tips</Typography>
        </div>
        
        <div className="tips-grid">
          <div className="tip">
            <Typography variant="labelSmall" style={{ color: 'var(--color-warning-c600)', marginBottom: '4px' }}>
              Always use Riverstyle
            </Typography>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c300)' }}>
              The AI is trained to use our design system. Don't accept custom colors or fonts.
            </Typography>
          </div>
          
          <div className="tip">
            <Typography variant="labelSmall" style={{ color: 'var(--color-warning-c600)', marginBottom: '4px' }}>
              Check icons exist
            </Typography>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c300)' }}>
              Ask AI to verify icons in <code>node_modules/@riversidefm/riverstyle/icons/</code> before using.
            </Typography>
          </div>
          
          <div className="tip">
            <Typography variant="labelSmall" style={{ color: 'var(--color-warning-c600)', marginBottom: '4px' }}>
              Paste Figma URLs
            </Typography>
            <Typography variant="bodySmall" style={{ color: 'var(--color-secondary-c300)' }}>
              The Figma MCP can extract designs directly. Include the node-id parameter.
            </Typography>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <Typography variant="headingSmall" style={{ marginBottom: '8px' }}>
          Ready to prototype?
        </Typography>
        <Typography variant="bodyMedium" style={{ color: 'var(--color-secondary-c400)', marginBottom: '24px' }}>
          Open the Cursor chat and describe what you want to build.
        </Typography>
        <div className="cta-buttons">
          <Link to="/dashboard">
            <Button variant="primary-48" onClick={() => {}}>
              View Dashboard Example
            </Button>
          </Link>
          <Link to="/prototype">
            <Button variant="secondary-48" onClick={() => {}}>
              Browse Components
            </Button>
          </Link>
        </div>
      </section>

      <style>{`
        .home-page {
          max-width: 900px;
          margin: 0 auto;
          padding-bottom: 64px;
        }
        
        .hero {
          text-align: center;
          padding: 32px 0 56px;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--color-transparent-p10);
          border: 1px solid var(--color-primary-c700);
          border-radius: 100px;
          font: var(--font-label-small);
          color: var(--color-primary-c500);
          margin-bottom: 20px;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, var(--color-primary-c600) 0%, var(--color-primary-c400) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .info-section {
          margin-bottom: 48px;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--color-secondary-c800);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-secondary-c200);
        }
        
        .info-card {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 24px;
        }
        
        .info-card strong {
          color: var(--color-secondary-c100);
        }
        
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 16px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font: var(--font-body-small);
          color: var(--color-secondary-c300);
        }
        
        .feature-list li svg {
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .feature-list li strong {
          color: var(--color-secondary-c100);
        }
        
        .workflow-grid {
          display: grid;
          gap: 16px;
        }
        
        .workflow-step {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--color-secondary-c900);
          border-radius: 12px;
          border: 1px solid var(--color-secondary-c700);
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--color-primary-c800);
          color: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font: var(--font-heading-xxsmall);
          flex-shrink: 0;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-content strong {
          color: var(--color-secondary-c100);
        }
        
        .step-content code {
          background: var(--color-transparent-p10);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 12px;
          color: var(--color-primary-c500);
        }
        
        .prompts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        @media (max-width: 640px) {
          .prompts-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .prompt-card {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 10px;
          padding: 16px;
        }
        
        .prompt-label {
          font: var(--font-tiny-label);
          color: var(--color-primary-c500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .links-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        @media (max-width: 640px) {
          .links-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .link-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .link-card:hover {
          background: var(--color-secondary-c800);
          border-color: var(--color-secondary-c600);
        }
        
        .link-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--color-secondary-c800);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-c600);
          flex-shrink: 0;
        }
        
        .link-card:hover .link-card-icon {
          background: var(--color-primary-c800);
          color: var(--color-white);
        }
        
        .link-card-content {
          flex: 1;
          min-width: 0;
        }
        
        .code-block {
          background: var(--color-secondary-c1000);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 12px;
          padding: 20px 24px;
          overflow-x: auto;
        }
        
        .code-block pre {
          margin: 0;
        }
        
        .code-block code {
          font-family: 'SF Mono', Monaco, 'Consolas', monospace;
          font-size: 13px;
          color: var(--color-secondary-c300);
          line-height: 1.7;
        }
        
        .tips-section .section-icon {
          background: var(--color-warning-c800);
          color: var(--color-warning-c500);
        }
        
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .tip {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 10px;
          padding: 16px;
        }
        
        .tip code {
          background: var(--color-transparent-p10);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 11px;
          color: var(--color-primary-c500);
        }
        
        .cta-section {
          text-align: center;
          padding: 48px 32px;
          background: linear-gradient(135deg, var(--color-transparent-p10) 0%, transparent 100%);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 16px;
        }
        
        .cta-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .cta-buttons a {
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}
