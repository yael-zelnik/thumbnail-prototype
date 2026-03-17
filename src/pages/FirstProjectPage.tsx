/**
 * YOUR FIRST PROJECT
 * 
 * Empty page template for building your app.
 * This page renders without the navigation header.
 */

import { Typography } from '@riversidefm/riverstyle'

export function FirstProjectPage() {
  return (
    <div className="first-project-page">
      <div className="empty-state">
        <Typography variant="headingLarge" color="secondary.c300">
          Start building your app here!
        </Typography>
      </div>

      <style>{`
        .first-project-page {
          min-height: 100vh;
          background: var(--color-secondary-c1100);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .empty-state {
          text-align: center;
        }
      `}</style>
    </div>
  )
}

