/**
 * PROTOTYPE PAGE - COMPONENT SHOWCASE
 * 
 * This page demonstrates ALL Riverstyle components with correct usage.
 * Use this as a reference for building your prototypes.
 * 
 * AI INSTRUCTIONS: Always use these exact patterns when using Riverstyle components.
 */

import { useState, useRef } from 'react'
import {
  Button,
  LinkButton,
  IconButton,
  Input,
  InputField,
  Checkbox,
  Switcher,
  Typography,
  Avatar,
  Toast,
  Tabs,
  Tooltip as _Tooltip,
  TooltipIcon,
  Spinner,
  DefaultSelect,
  Popover,
  Icons,
} from '@riversidefm/riverstyle'

export function PrototypePage() {
  // State for interactive components
  const [switcherOn, setSwitcherOn] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('tab1')
  const [selectedOption, setSelectedOption] = useState<{ id: string; label: string } | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverRef = useRef<HTMLButtonElement>(null)

  const selectOptions = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ]

  const showToast = (type: 'success' | 'error' | 'info') => {
    if (type === 'success') {
      Toast.tasks.success('Success! Your action was completed.')
    } else if (type === 'error') {
      Toast.tasks.error('Error! Something went wrong.')
    } else {
      Toast.tasks.info('Info: Here is some information.')
    }
  }

  return (
    <div className="prototype-page">
      <Toast.Container />
      
      <header className="prototype-header">
        <Typography variant="headingLarge">
          Riverstyle Components
        </Typography>
        <Typography variant="bodyMedium" color="secondary.c300">
          All available components with correct usage patterns
        </Typography>
      </header>

      <div className="component-grid">
        
        {/* ============ BUTTONS ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Button</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Variants: primary, secondary, tertiary, ghost, danger, upgrade, blurry + height (48/44/40/36/32)
          </Typography>
          <div className="component-demo">
            <Button variant="primary-48" onClick={() => {}}>Primary 48</Button>
            <Button variant="secondary-48" onClick={() => {}}>Secondary</Button>
            <Button variant="tertiary-48" onClick={() => {}}>Tertiary</Button>
            <Button variant="ghost-48" onClick={() => {}}>Ghost</Button>
          </div>
          <div className="component-demo">
            <Button variant="danger-48" onClick={() => {}}>Danger</Button>
            <Button variant="upgrade-48" onClick={() => {}}>Upgrade</Button>
            <Button variant="blurry-48" onClick={() => {}}>Blurry</Button>
          </div>
          <div className="component-demo">
            <Button variant="primary-48" onClick={() => {}} leftIcon={Icons.General.Plus}>With Icon</Button>
            <Button variant="primary-48" onClick={() => {}} loading>Loading</Button>
            <Button variant="primary-48" onClick={() => {}} disabled>Disabled</Button>
          </div>
          <code className="code-snippet">{`<Button variant="primary-48" onClick={() => {}}>Label</Button>`}</code>
        </section>

        {/* ============ LINK BUTTON ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">LinkButton</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Same as Button but navigates with React Router
          </Typography>
          <div className="component-demo">
            <LinkButton variant="primary-48" to="/">Home Link</LinkButton>
            <LinkButton variant="secondary-48" to="/riverstyle">Riverstyle Link</LinkButton>
          </div>
          <code className="code-snippet">{`<LinkButton variant="primary-48" to="/path">Label</LinkButton>`}</code>
        </section>

        {/* ============ ICON BUTTON ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">IconButton</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Variants: ghost, secondary, round-primary, round-secondary, blurry + size
          </Typography>
          <div className="component-demo">
            <IconButton variant="ghost-44" icon={Icons.General.Settings01} aria-label="Settings" onClick={() => {}} />
            <IconButton variant="secondary-44" icon={Icons.General.Plus} aria-label="Add" onClick={() => {}} />
            <IconButton variant="round-primary-44" icon={Icons.General.Check} aria-label="Confirm" onClick={() => {}} />
            <IconButton variant="round-secondary-44" icon={Icons.General.XClose} aria-label="Close" onClick={() => {}} />
            <IconButton variant="blurry-44" icon={Icons.General.SearchMd} aria-label="Search" onClick={() => {}} />
          </div>
          <code className="code-snippet">{`<IconButton variant="ghost-44" icon={Icons.General.Settings01} aria-label="Settings" onClick={() => {}} />`}</code>
        </section>

        {/* ============ INPUT ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Input</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Basic text input with placeholder, error, disabled states
          </Typography>
          <div className="component-demo column">
            <Input placeholder="Default input..." />
            <Input placeholder="With error..." />
            <Input placeholder="Disabled input..." disabled />
          </div>
          <code className="code-snippet">{`<Input placeholder="Enter text..." error="Error message" />`}</code>
        </section>

        {/* ============ INPUT FIELD ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">InputField</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Input with label - requires inputProps, labelProps, errorProps objects
          </Typography>
          <div className="component-demo column">
            <InputField
              inputProps={{ placeholder: 'you@example.com' }}
              labelProps={{ label: 'Email Address' }}
              errorProps={{ message: '' }}
            />
            <InputField
              inputProps={{ placeholder: 'Enter password', type: 'password' }}
              labelProps={{ label: 'Password' }}
              errorProps={{ message: 'Password is required' }}
            />
          </div>
          <code className="code-snippet">{`<InputField inputProps={{ placeholder: "..." }} labelProps={{ label: "Label" }} errorProps={{ message: "" }} />`}</code>
        </section>

        {/* ============ CHECKBOX ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Checkbox</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Checkbox with name prop (required)
          </Typography>
          <div className="component-demo">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Checkbox
                name="terms"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              <Typography variant="bodyMedium">Accept terms and conditions</Typography>
            </label>
          </div>
          <code className="code-snippet">{`<Checkbox name="field" checked={checked} onChange={(e) => setChecked(e.target.checked)} />`}</code>
        </section>

        {/* ============ SWITCHER ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Switcher</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Toggle switch with checked state
          </Typography>
          <div className="component-demo">
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <Switcher
                checked={switcherOn}
                onChange={(checked) => setSwitcherOn(checked)}
                aria-label="Toggle feature"
              />
              <Typography variant="bodyMedium">Enable notifications</Typography>
            </label>
          </div>
          <code className="code-snippet">{`<Switcher checked={on} onChange={(checked) => setOn(checked)} />`}</code>
        </section>

        {/* ============ TYPOGRAPHY ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Typography</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Variants: headingXLarge to tinyLabel, colors: primary, secondary, success, error, etc.
          </Typography>
          <div className="component-demo column" style={{ alignItems: 'flex-start' }}>
            <Typography variant="headingXLarge">headingXLarge</Typography>
            <Typography variant="headingLarge">headingLarge</Typography>
            <Typography variant="headingMedium">headingMedium</Typography>
            <Typography variant="headingSmall">headingSmall</Typography>
            <Typography variant="headingXSmall">headingXSmall</Typography>
            <Typography variant="bodyLarge">bodyLarge</Typography>
            <Typography variant="bodyMedium">bodyMedium</Typography>
            <Typography variant="bodySmall">bodySmall</Typography>
            <Typography variant="labelMedium">labelMedium</Typography>
            <Typography variant="labelSmall">labelSmall</Typography>
          </div>
          <div className="component-demo">
            <Typography variant="bodyMedium" color="primary.c800">Primary</Typography>
            <Typography variant="bodyMedium" color="success.c700">Success</Typography>
            <Typography variant="bodyMedium" color="warning.c700">Warning</Typography>
            <Typography variant="bodyMedium" color="error.c700">Error</Typography>
          </div>
          <code className="code-snippet">{`<Typography variant="headingLarge" color="primary.c800">Text</Typography>`}</code>
        </section>

        {/* ============ AVATAR ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Avatar</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Variants: circle-24, circle-32, circle-40
          </Typography>
          <div className="component-demo">
            <Avatar variant="circle-24">AB</Avatar>
            <Avatar variant="circle-32">CD</Avatar>
            <Avatar variant="circle-40">EF</Avatar>
          </div>
          <code className="code-snippet">{`<Avatar variant="circle-40">AB</Avatar>`}</code>
        </section>

        {/* ============ TABS ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Tabs</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Tab navigation with Tabs.Tab children
          </Typography>
          <div className="component-demo column">
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.Tab value="tab1">First Tab</Tabs.Tab>
              <Tabs.Tab value="tab2">Second Tab</Tabs.Tab>
              <Tabs.Tab value="tab3">Third Tab</Tabs.Tab>
            </Tabs>
            <Typography variant="bodySmall" color="secondary.c400">
              Active: {activeTab}
            </Typography>
          </div>
          <code className="code-snippet">{`<Tabs value={tab} onChange={setTab}><Tabs.Tab value="t1">Tab</Tabs.Tab></Tabs>`}</code>
        </section>

        {/* ============ TOOLTIP ICON ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">TooltipIcon</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Info icon with tooltip (hover to see)
          </Typography>
          <div className="component-demo">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="bodyMedium">What is this?</Typography>
              <TooltipIcon content="This is helpful information displayed in a tooltip when you hover over the icon." />
            </span>
          </div>
          <code className="code-snippet">{`<TooltipIcon content="Help text" />`}</code>
        </section>

        {/* ============ DEFAULT SELECT ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">DefaultSelect</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Dropdown select with options array
          </Typography>
          <div className="component-demo">
            <div style={{ width: '200px' }}>
              <DefaultSelect
                options={selectOptions}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                placeholder="Select an option..."
              />
            </div>
          </div>
          <code className="code-snippet">{`<DefaultSelect options={[{id, label}]} selectedOption={opt} setSelectedOption={setOpt} />`}</code>
        </section>

        {/* ============ POPOVER ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Popover</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Positioned popover anchored to a reference element
          </Typography>
          <div className="component-demo">
            <Button
              variant="secondary-48"
              onClick={() => setPopoverOpen(!popoverOpen)}
              reference={popoverRef}
            >
              Toggle Popover
            </Button>
            <Popover
              opened={popoverOpen}
              onClose={() => setPopoverOpen(false)}
              reference={popoverRef}
              placement="bottom-start"
            >
              <div style={{ padding: '16px', background: 'var(--color-secondary-c800)', borderRadius: '8px' }}>
                <Typography variant="bodyMedium">Popover content!</Typography>
                <Button variant="primary-36" onClick={() => setPopoverOpen(false)}>Close</Button>
              </div>
            </Popover>
          </div>
          <code className="code-snippet">{`<Popover opened={open} onClose={() => {}} reference={ref} placement="bottom">...</Popover>`}</code>
        </section>

        {/* ============ TOAST ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Toast</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Toast notifications - add Toast.Container to your app
          </Typography>
          <div className="component-demo">
            <Button variant="primary-48" onClick={() => showToast('success')}>Success Toast</Button>
            <Button variant="danger-48" onClick={() => showToast('error')}>Error Toast</Button>
            <Button variant="secondary-48" onClick={() => showToast('info')}>Info Toast</Button>
          </div>
          <code className="code-snippet">{`Toast.tasks.success("Message"); Toast.tasks.error("Error");`}</code>
        </section>

        {/* ============ SPINNER ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Spinner</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Loading spinner
          </Typography>
          <div className="component-demo">
            <Spinner />
          </div>
          <code className="code-snippet">{`<Spinner />`}</code>
        </section>

        {/* ============ ICONS ============ */}
        <section className="component-card">
          <Typography variant="headingSmall">Icons</Typography>
          <Typography variant="bodySmall" color="secondary.c400">
            Categories: General, Arrows, Alerts, Editor, Media, Users, etc.
          </Typography>
          <div className="component-demo">
            <Icons.General.Settings01 style={{ width: 24, height: 24 }} />
            <Icons.General.Plus style={{ width: 24, height: 24 }} />
            <Icons.General.Check style={{ width: 24, height: 24 }} />
            <Icons.General.XClose style={{ width: 24, height: 24 }} />
            <Icons.General.SearchMd style={{ width: 24, height: 24 }} />
            <Icons.Arrows.ArrowRight style={{ width: 24, height: 24 }} />
            <Icons.Arrows.ChevronDown style={{ width: 24, height: 24 }} />
          </div>
          <code className="code-snippet">{`<Icons.General.Settings01 style={{ width: 24, height: 24 }} />`}</code>
        </section>

      </div>

      <style>{`
        .prototype-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .prototype-header {
          text-align: center;
          padding-bottom: 32px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--color-secondary-c700);
        }
        
        .component-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 24px;
        }
        
        .component-card {
          background: var(--color-secondary-c900);
          border: 1px solid var(--color-secondary-c700);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .component-demo {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          padding: 16px;
          background: var(--color-secondary-c1000);
          border-radius: 8px;
        }
        
        .component-demo.column {
          flex-direction: column;
          align-items: stretch;
        }
        
        .code-snippet {
          display: block;
          background: var(--color-black);
          padding: 12px;
          border-radius: 8px;
          font-family: 'SF Mono', Monaco, monospace;
          font-size: 11px;
          color: var(--color-primary-c400);
          overflow-x: auto;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
