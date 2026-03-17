/**
 * RIVERSTYLE STORYBOOK PAGE
 * 
 * Full-screen embedded Storybook for the Riverstyle design system.
 * 
 * AI INSTRUCTIONS:
 * - Reference this page when building prototypes
 * - Always use Riverstyle components over custom implementations
 */

export function RiverstylePage() {
  const storybookUrl = 'https://storybook.rs-prod.riverside.fm/'

  return (
    <div className="storybook-page">
      <iframe 
        src={storybookUrl}
        title="Riverstyle Storybook"
        className="storybook-frame"
      />
      <style>{`
        .storybook-page {
          position: fixed;
          top: 65px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
        }
        
        .storybook-frame {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  )
}
