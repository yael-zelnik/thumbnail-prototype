import { ReactNode, useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Layout component using Riverstyle design tokens
 * This provides consistent navigation across all prototype pages
 */
interface LayoutProps {
  children: ReactNode
}

// Platform screens that can be added to
const platformScreens = [
  { path: '/dashboard', label: 'Navigation' },
  { path: '/projects', label: 'Projects' },
  { path: '/editor', label: 'Editor' },
  { path: '/studio', label: 'Studio' },
  // Add more platform screens here as they are created
]

// Project screens
const projectScreens = [
  { path: '/projects/first', label: 'Your first project' },
  // Add more projects here
]

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false)
  const [projectsMenuOpen, setProjectsMenuOpen] = useState(false)
  const platformMenuRef = useRef<HTMLDivElement>(null)
  const projectsMenuRef = useRef<HTMLDivElement>(null)
  
  const isActive = (path: string) => location.pathname === path
  const isPlatformActive = platformScreens.some(screen => location.pathname === screen.path)
  const isProjectsActive = projectScreens.some(screen => location.pathname.startsWith(screen.path))

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (platformMenuRef.current && !platformMenuRef.current.contains(event.target as Node)) {
        setPlatformMenuOpen(false)
      }
      if (projectsMenuRef.current && !projectsMenuRef.current.contains(event.target as Node)) {
        setProjectsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--color-primary-c800, #7848ff)"/>
            <path d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V20C24 21.1046 23.1046 22 22 22H10C8.89543 22 8 21.1046 8 20V12Z" fill="white"/>
            <circle cx="12" cy="16" r="2" fill="var(--color-primary-c800, #7848ff)"/>
            <circle cx="20" cy="16" r="2" fill="var(--color-primary-c800, #7848ff)"/>
          </svg>
          <span>Riverside Prototype</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/riverstyle" className={`nav-link ${isActive('/riverstyle') ? 'active' : ''}`}>
            Storybook
          </Link>
          <Link to="/prototype" className={`nav-link ${isActive('/prototype') ? 'active' : ''}`}>
            Components
          </Link>
          <Link to="/my-components" className={`nav-link ${isActive('/my-components') ? 'active' : ''}`}>
            My Components
          </Link>
          
          {/* Platform Dropdown */}
          <div className="nav-dropdown" ref={platformMenuRef}>
            <button 
              className={`nav-link nav-dropdown-trigger ${isPlatformActive ? 'dropdown-active' : ''}`}
              onClick={() => setPlatformMenuOpen(!platformMenuOpen)}
            >
              Platform
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px', transform: platformMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
            {platformMenuOpen && (
              <div className="nav-dropdown-menu">
                {platformScreens.map(screen => (
                  <Link 
                    key={screen.path}
                    to={screen.path} 
                    className={`nav-dropdown-item ${isActive(screen.path) ? 'active' : ''}`}
                    onClick={() => setPlatformMenuOpen(false)}
                  >
                    {screen.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Projects Dropdown */}
          <div className="nav-dropdown" ref={projectsMenuRef}>
            <button 
              className={`nav-link nav-dropdown-trigger ${isProjectsActive ? 'dropdown-active' : ''}`}
              onClick={() => setProjectsMenuOpen(!projectsMenuOpen)}
            >
              Projects
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px', transform: projectsMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>
            {projectsMenuOpen && (
              <div className="nav-dropdown-menu">
                {projectScreens.map(screen => (
                  <Link 
                    key={screen.path}
                    to={screen.path} 
                    className={`nav-dropdown-item ${isActive(screen.path) ? 'active' : ''}`}
                    onClick={() => setProjectsMenuOpen(false)}
                  >
                    {screen.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: var(--color-secondary-c1000, #151515);
          border-bottom: 1px solid var(--color-secondary-c700, #2b2b2b);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font: var(--font-label-medium, 500 14px/20px Inter);
          color: var(--color-secondary-c100, #fafafa);
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        
        .nav-brand:hover {
          opacity: 0.85;
        }
        
        .nav-links {
          display: flex;
          gap: 8px;
        }
        
        .nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--color-secondary-c300, #888888);
          font: var(--font-label-medium, 500 14px/20px Inter);
          transition: all 0.2s ease;
          background: transparent;
        }
        
        .nav-link:hover {
          color: var(--color-secondary-c100, #fafafa);
          background: var(--color-secondary-c800, #222222);
        }
        
        .nav-link.active {
          color: var(--color-white, #ffffff);
          background: var(--color-primary-c800, #7848ff);
        }
        
        .nav-dropdown {
          position: relative;
        }
        
        .nav-dropdown-trigger {
          display: flex;
          align-items: center;
          border: none;
          cursor: pointer;
        }
        
        .nav-dropdown-trigger.dropdown-active {
          color: var(--color-primary-c500, #b196ff);
          background: transparent;
        }
        
        .nav-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: var(--color-secondary-c900, #1d1d1d);
          border: 1px solid var(--color-secondary-c700, #2b2b2b);
          border-radius: 8px;
          padding: 4px;
          min-width: 180px;
          z-index: 200;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .nav-dropdown-item {
          display: block;
          padding: 8px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--color-secondary-c200, #bbbbbb);
          font: var(--font-label-medium, 500 14px/20px Inter);
          transition: all 0.2s ease;
        }
        
        .nav-dropdown-item:hover {
          color: var(--color-secondary-c100, #fafafa);
          background: var(--color-secondary-c800, #222222);
        }
        
        .nav-dropdown-item.active {
          color: var(--color-white, #ffffff);
          background: var(--color-primary-c800, #7848ff);
        }
        
        .main-content {
          flex: 1;
          padding: 32px 24px;
        }
      `}</style>
    </div>
  )
}
