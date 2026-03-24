'use client'

import type React from 'react'
import { useState, useRef, useCallback } from 'react'
import { useUser } from '@/lib/user-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Layout,
  Type,
  ImageIcon,
  Square,
  FormInput,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Move,
  Maximize2,
  Copy,
  MousePointer,
  Monitor,
  Tablet,
  Smartphone,
  Undo,
  Redo,
  Save,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'

// Component type definition
interface CanvasComponentDef {
  id: string
  name: string
  category: string
  icon: React.ElementType
  tier: 'free' | 'supporter' | 'builder' | 'enterprise'
  defaultProps: Record<string, any>
  defaultSize: { width: number; height: number }
}

// Placed component instance on canvas
interface PlacedComponent {
  instanceId: string
  componentId: string
  x: number
  y: number
  width: number
  height: number
  props: Record<string, any>
  zIndex: number
}

const COMPONENTS: CanvasComponentDef[] = [
  {
    id: 'heading',
    name: 'Heading',
    category: 'Typography',
    icon: Type,
    tier: 'free',
    defaultProps: { text: 'Heading Text', level: 'h1', align: 'left' },
    defaultSize: { width: 300, height: 60 },
  },
  {
    id: 'text',
    name: 'Text Block',
    category: 'Typography',
    icon: Type,
    tier: 'free',
    defaultProps: { text: 'Enter your text here...', align: 'left' },
    defaultSize: { width: 300, height: 80 },
  },
  {
    id: 'button',
    name: 'Button',
    category: 'Elements',
    icon: Square,
    tier: 'free',
    defaultProps: { text: 'Click Me', variant: 'primary' },
    defaultSize: { width: 150, height: 50 },
  },
  {
    id: 'image',
    name: 'Image',
    category: 'Media',
    icon: ImageIcon,
    tier: 'free',
    defaultProps: { src: '', alt: 'Image' },
    defaultSize: { width: 300, height: 200 },
  },
  {
    id: 'container',
    name: 'Container',
    category: 'Layout',
    icon: Layout,
    tier: 'free',
    defaultProps: { bgColor: 'transparent', padding: '16px', borderRadius: '8px' },
    defaultSize: { width: 400, height: 300 },
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    icon: Square,
    tier: 'free',
    defaultProps: { color: '#1E293B', thickness: '1px' },
    defaultSize: { width: 300, height: 20 },
  },
  {
    id: 'input',
    name: 'Input Field',
    category: 'Forms',
    icon: FormInput,
    tier: 'free',
    defaultProps: { placeholder: 'Enter text...', label: 'Label' },
    defaultSize: { width: 250, height: 70 },
  },
  {
    id: 'form',
    name: 'Form',
    category: 'Forms',
    icon: FormInput,
    tier: 'supporter',
    defaultProps: { fields: ['name', 'email'] },
    defaultSize: { width: 350, height: 250 },
  },
  {
    id: 'card',
    name: 'Card',
    category: 'Elements',
    icon: Square,
    tier: 'free',
    defaultProps: { title: 'Card Title', description: 'Card description goes here' },
    defaultSize: { width: 300, height: 180 },
  },
  {
    id: 'hero',
    name: 'Hero Section',
    category: 'Sections',
    icon: Layout,
    tier: 'supporter',
    defaultProps: { headline: 'Welcome', subheadline: 'Your subheadline here', ctaText: 'Get Started' },
    defaultSize: { width: 600, height: 350 },
  },
  {
    id: 'navbar',
    name: 'Navigation Bar',
    category: 'Sections',
    icon: Layout,
    tier: 'supporter',
    defaultProps: { brand: 'Brand', links: ['Home', 'About', 'Contact'] },
    defaultSize: { width: 600, height: 60 },
  },
  {
    id: 'footer',
    name: 'Footer',
    category: 'Sections',
    icon: Layout,
    tier: 'supporter',
    defaultProps: { copyright: '\u00A9 2026 Company' },
    defaultSize: { width: 600, height: 100 },
  },
]

const CATEGORIES = ['All', 'Typography', 'Elements', 'Layout', 'Media', 'Forms', 'Sections']

// Component renderer
function RenderComponent({
  component,
  def,
}: { component: PlacedComponent; def: CanvasComponentDef; isSelected: boolean }) {
  const { props } = component

  switch (def.id) {
    case 'heading': {
      const HeadingTag = (props.level || 'h1') as keyof JSX.IntrinsicElements
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', textAlign: props.align }}>
          <HeadingTag
            style={{
              width: '100%',
              color: '#E8EAED',
              fontWeight: props.level === 'h1' ? 700 : props.level === 'h2' ? 600 : 500,
              fontSize: props.level === 'h1' ? '1.875rem' : props.level === 'h2' ? '1.5rem' : '1.25rem',
            }}
          >
            {props.text}
          </HeadingTag>
        </div>
      )
    }

    case 'text':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0.5rem', overflow: 'hidden', textAlign: props.align }}>
          <p style={{ fontSize: '0.875rem', color: '#E8EAED' }}>{props.text}</p>
        </div>
      )

    case 'button':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '0.875rem',
              border: props.variant === 'outline' ? '1px solid #1E293B' : 'none',
              background: props.variant === 'primary' ? '#6EE05A' : props.variant === 'secondary' ? '#162032' : 'transparent',
              color: props.variant === 'primary' ? '#0B0F19' : '#E8EAED',
              cursor: 'pointer',
            }}
          >
            {props.text}
          </button>
        </div>
      )

    case 'image':
      return (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(30, 41, 59, 0.5)', borderRadius: '4px', overflow: 'hidden',
        }}>
          {props.src ? (
            <img src={props.src} alt={props.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#4A5568' }}>
              <ImageIcon style={{ width: 32, height: 32 }} />
              <span style={{ fontSize: '0.75rem' }}>Add image URL</span>
            </div>
          )}
        </div>
      )

    case 'container':
      return (
        <div style={{
          width: '100%', height: '100%',
          border: '1px dashed rgba(74, 85, 104, 0.3)',
          borderRadius: props.borderRadius,
          backgroundColor: props.bgColor,
          padding: props.padding,
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A5568', fontSize: '0.75rem' }}>
            Container
          </div>
        </div>
      )

    case 'divider':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <hr style={{ width: '100%', borderColor: props.color, borderWidth: props.thickness, borderStyle: 'solid' }} />
        </div>
      )

    case 'input':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#E8EAED' }}>{props.label}</label>
          <input
            type="text"
            placeholder={props.placeholder}
            readOnly
            style={{
              width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.875rem',
              borderRadius: '6px', border: '1px solid #1E293B', background: '#0B0F19', color: '#E8EAED',
            }}
          />
        </div>
      )

    case 'form':
      return (
        <div style={{ width: '100%', height: '100%', padding: '1rem', border: '1px solid #1E293B', borderRadius: '8px', background: '#111827', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontWeight: 500, fontSize: '0.875rem', color: '#E8EAED' }}>Contact Form</h4>
          {props.fields?.map((field: string, i: number) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#7A8290' }}>{field}</label>
              <input readOnly style={{ width: '100%', padding: '4px 8px', fontSize: '0.875rem', borderRadius: '4px', border: '1px solid #1E293B', background: '#0B0F19', color: '#E8EAED' }} />
            </div>
          ))}
          <button style={{ marginTop: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem', background: '#6EE05A', color: '#0B0F19', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Submit</button>
        </div>
      )

    case 'card':
      return (
        <div style={{ width: '100%', height: '100%', padding: '1rem', border: '1px solid #1E293B', borderRadius: '8px', background: '#111827', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ fontWeight: 600, color: '#E8EAED' }}>{props.title}</h3>
          <p style={{ fontSize: '0.875rem', color: '#7A8290' }}>{props.description}</p>
        </div>
      )

    case 'hero':
      return (
        <div style={{
          width: '100%', height: '100%', padding: '2rem',
          background: 'linear-gradient(135deg, rgba(110, 224, 90, 0.12), rgba(110, 224, 90, 0.03))',
          borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E8EAED' }}>{props.headline}</h1>
          <p style={{ color: '#7A8290' }}>{props.subheadline}</p>
          <button style={{ padding: '0.5rem 1.5rem', background: '#6EE05A', color: '#0B0F19', borderRadius: '6px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
            {props.ctaText}
          </button>
        </div>
      )

    case 'navbar':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0 1rem', background: '#111827', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, color: '#E8EAED' }}>{props.brand}</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {props.links?.map((link: string, i: number) => (
              <span key={i} style={{ fontSize: '0.875rem', color: '#7A8290', cursor: 'pointer' }}>{link}</span>
            ))}
          </div>
        </div>
      )

    case 'footer':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0 1rem', background: 'rgba(30, 41, 59, 0.3)', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#7A8290' }}>{props.copyright}</span>
        </div>
      )

    default:
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#4A5568' }}>{def.name}</span>
        </div>
      )
  }
}

// Property editor for selected component
function PropertyEditor({
  component,
  def,
  onChange,
}: {
  component: PlacedComponent
  def: CanvasComponentDef
  onChange: (props: Record<string, any>) => void
}) {
  const { props } = component

  switch (def.id) {
    case 'heading':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Text</Label>
            <Input value={props.text} onChange={(e) => onChange({ ...props, text: e.target.value })} />
          </div>
          <div>
            <Label>Level</Label>
            <Select value={props.level} onValueChange={(v) => onChange({ ...props, level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1 - Large</SelectItem>
                <SelectItem value="h2">H2 - Medium</SelectItem>
                <SelectItem value="h3">H3 - Small</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Alignment</Label>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {(['left', 'center', 'right'] as const).map((align) => (
                <Button
                  key={align}
                  variant={props.align === align ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => onChange({ ...props, align })}
                >
                  {align === 'left' && <AlignLeft style={{ width: 16, height: 16 }} />}
                  {align === 'center' && <AlignCenter style={{ width: 16, height: 16 }} />}
                  {align === 'right' && <AlignRight style={{ width: 16, height: 16 }} />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'text':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Content</Label>
            <Textarea value={props.text} onChange={(e) => onChange({ ...props, text: e.target.value })} rows={4} />
          </div>
          <div>
            <Label>Alignment</Label>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {(['left', 'center', 'right'] as const).map((align) => (
                <Button
                  key={align}
                  variant={props.align === align ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => onChange({ ...props, align })}
                >
                  {align === 'left' && <AlignLeft style={{ width: 16, height: 16 }} />}
                  {align === 'center' && <AlignCenter style={{ width: 16, height: 16 }} />}
                  {align === 'right' && <AlignRight style={{ width: 16, height: 16 }} />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'button':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Button Text</Label>
            <Input value={props.text} onChange={(e) => onChange({ ...props, text: e.target.value })} />
          </div>
          <div>
            <Label>Style</Label>
            <Select value={props.variant} onValueChange={(v) => onChange({ ...props, variant: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Image URL</Label>
            <Input value={props.src} onChange={(e) => onChange({ ...props, src: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input value={props.alt} onChange={(e) => onChange({ ...props, alt: e.target.value })} />
          </div>
        </div>
      )

    case 'card':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Title</Label>
            <Input value={props.title} onChange={(e) => onChange({ ...props, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={props.description} onChange={(e) => onChange({ ...props, description: e.target.value })} rows={3} />
          </div>
        </div>
      )

    case 'hero':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Headline</Label>
            <Input value={props.headline} onChange={(e) => onChange({ ...props, headline: e.target.value })} />
          </div>
          <div>
            <Label>Subheadline</Label>
            <Input value={props.subheadline} onChange={(e) => onChange({ ...props, subheadline: e.target.value })} />
          </div>
          <div>
            <Label>CTA Button Text</Label>
            <Input value={props.ctaText} onChange={(e) => onChange({ ...props, ctaText: e.target.value })} />
          </div>
        </div>
      )

    case 'input':
      return (
        <div className="canvas-props-group">
          <div>
            <Label>Label</Label>
            <Input value={props.label} onChange={(e) => onChange({ ...props, label: e.target.value })} />
          </div>
          <div>
            <Label>Placeholder</Label>
            <Input value={props.placeholder} onChange={(e) => onChange({ ...props, placeholder: e.target.value })} />
          </div>
        </div>
      )

    default:
      return <div style={{ fontSize: '0.875rem', color: '#4A5568' }}>No editable properties for this component.</div>
  }
}

export default function CanvasPage() {
  const { tier } = useUser()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [components, setComponents] = useState<PlacedComponent[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [history, setHistory] = useState<PlacedComponent[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ offsetX: number; offsetY: number; mode: 'move' | 'resize' } | null>(null)

  const tierOrder = { free: 0, supporter: 1, builder: 2, enterprise: 3 }
  const canAccess = (t: string) => tierOrder[tier as keyof typeof tierOrder] >= tierOrder[t as keyof typeof tierOrder]

  const selectedComponent = components.find((c) => c.instanceId === selectedId)
  const selectedDef = selectedComponent ? COMPONENTS.find((d) => d.id === selectedComponent.componentId) : null

  const filteredLibrary = COMPONENTS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'All' || c.category === selectedCategory
    return matchSearch && matchCategory
  })

  // Save to history
  const saveHistory = useCallback(
    (newComponents: PlacedComponent[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(newComponents)
        return newHistory
      })
      setHistoryIndex((prev) => prev + 1)
    },
    [historyIndex],
  )

  // Add component to canvas
  const addComponent = (def: CanvasComponentDef) => {
    if (!canAccess(def.tier)) return

    const newComp: PlacedComponent = {
      instanceId: `${def.id}-${Date.now()}`,
      componentId: def.id,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      width: def.defaultSize.width,
      height: def.defaultSize.height,
      props: { ...def.defaultProps },
      zIndex: components.length,
    }

    const newComponents = [...components, newComp]
    setComponents(newComponents)
    saveHistory(newComponents)
    setSelectedId(newComp.instanceId)
    setRightPanelOpen(true)
  }

  // Delete selected component
  const deleteSelected = () => {
    if (!selectedId) return
    const newComponents = components.filter((c) => c.instanceId !== selectedId)
    setComponents(newComponents)
    saveHistory(newComponents)
    setSelectedId(null)
    setRightPanelOpen(false)
  }

  // Duplicate selected component
  const duplicateSelected = () => {
    if (!selectedComponent) return
    const newComp: PlacedComponent = {
      ...selectedComponent,
      instanceId: `${selectedComponent.componentId}-${Date.now()}`,
      x: selectedComponent.x + 20,
      y: selectedComponent.y + 20,
      zIndex: components.length,
      props: { ...selectedComponent.props },
    }
    const newComponents = [...components, newComp]
    setComponents(newComponents)
    saveHistory(newComponents)
    setSelectedId(newComp.instanceId)
  }

  // Update component props
  const updateProps = (props: Record<string, any>) => {
    if (!selectedId) return
    const newComponents = components.map((c) => (c.instanceId === selectedId ? { ...c, props } : c))
    setComponents(newComponents)
    saveHistory(newComponents)
  }

  // Mouse down on component - start drag
  const handleMouseDown = (e: React.MouseEvent, instanceId: string, mode: 'move' | 'resize') => {
    e.stopPropagation()
    const comp = components.find((c) => c.instanceId === instanceId)
    if (!comp) return

    setSelectedId(instanceId)
    setRightPanelOpen(true)

    const rect = (e.target as HTMLElement).closest('[data-canvas-item]')?.getBoundingClientRect()
    if (!rect) return

    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      mode,
    }

    // Bring to front
    const maxZ = Math.max(...components.map((c) => c.zIndex))
    if (comp.zIndex < maxZ) {
      setComponents((prev) => prev.map((c) => (c.instanceId === instanceId ? { ...c, zIndex: maxZ + 1 } : c)))
    }
  }

  // Mouse move on canvas - drag or resize
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || !selectedId || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const comp = components.find((c) => c.instanceId === selectedId)
    if (!comp) return

    if (dragRef.current.mode === 'move') {
      const newX = Math.max(0, e.clientX - canvasRect.left - dragRef.current.offsetX)
      const newY = Math.max(0, e.clientY - canvasRect.top - dragRef.current.offsetY)
      setComponents((prev) => prev.map((c) => (c.instanceId === selectedId ? { ...c, x: newX, y: newY } : c)))
    } else if (dragRef.current.mode === 'resize') {
      const newWidth = Math.max(100, e.clientX - canvasRect.left - comp.x)
      const newHeight = Math.max(50, e.clientY - canvasRect.top - comp.y)
      setComponents((prev) => prev.map((c) => (c.instanceId === selectedId ? { ...c, width: newWidth, height: newHeight } : c)))
    }
  }

  // Mouse up - end drag
  const handleMouseUp = () => {
    if (dragRef.current) {
      saveHistory(components)
    }
    dragRef.current = null
  }

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      setComponents(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      setComponents(history[historyIndex + 1])
    }
  }

  // Canvas width based on view mode
  const canvasWidth = viewMode === 'desktop' ? '100%' : viewMode === 'tablet' ? '768px' : '375px'

  return (
    <div className="canvas-wrapper">
      {/* Left Panel - Component Library */}
      {leftPanelOpen && (
        <div className="canvas-left-panel">
          <div className="canvas-panel-header">
            <h2 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#E8EAED' }}>Components</h2>
            <Button variant="ghost" size="icon" onClick={() => setLeftPanelOpen(false)}>
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </Button>
          </div>

          <div style={{ padding: '0.75rem', borderBottom: '1px solid #1E293B' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4A5568' }} />
              <Input
                placeholder="Search..."
                style={{ paddingLeft: '2rem', height: 32, fontSize: '0.875rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="All" onValueChange={setSelectedCategory} className="canvas-tabs-container">
            <TabsList className="canvas-category-tabs">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="canvas-category-tab">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="canvas-library-list">
              {filteredLibrary.map((comp) => {
                const accessible = canAccess(comp.tier)
                const Icon = comp.icon

                return (
                  <button
                    key={comp.id}
                    onClick={() => addComponent(comp)}
                    disabled={!accessible}
                    className={`canvas-lib-item ${accessible ? 'accessible' : 'locked'}`}
                  >
                    <div className="canvas-lib-icon">
                      <Icon style={{ width: 16, height: 16 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#E8EAED' }}>{comp.name}</span>
                        {!accessible && (
                          <Badge variant="secondary" className="canvas-tier-badge">
                            {comp.tier.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#4A5568' }}>{comp.category}</span>
                    </div>
                    <Plus style={{ width: 16, height: 16, color: '#4A5568' }} />
                  </button>
                )
              })}
            </div>
          </Tabs>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="canvas-main">
        {/* Toolbar */}
        <div className="canvas-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!leftPanelOpen && (
              <Button variant="ghost" size="sm" onClick={() => setLeftPanelOpen(true)}>
                <ChevronRight style={{ width: 16, height: 16, marginRight: 4 }} />
                Components
              </Button>
            )}
            <div className="canvas-divider" />
            <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0}>
              <Undo style={{ width: 16, height: 16 }} />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo style={{ width: 16, height: 16 }} />
            </Button>
            {selectedId && (
              <>
                <div className="canvas-divider" />
                <Button variant="ghost" size="icon" onClick={duplicateSelected}>
                  <Copy style={{ width: 16, height: 16 }} />
                </Button>
                <Button variant="ghost" size="icon" className="canvas-delete-btn" onClick={deleteSelected}>
                  <Trash2 style={{ width: 16, height: 16 }} />
                </Button>
              </>
            )}
          </div>

          <div className="canvas-view-modes">
            <Button variant={viewMode === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('desktop')}>
              <Monitor style={{ width: 16, height: 16 }} />
            </Button>
            <Button variant={viewMode === 'tablet' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('tablet')}>
              <Tablet style={{ width: 16, height: 16 }} />
            </Button>
            <Button variant={viewMode === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('mobile')}>
              <Smartphone style={{ width: 16, height: 16 }} />
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button variant="outline" size="sm">
              <Eye style={{ width: 16, height: 16, marginRight: 4 }} />
              Preview
            </Button>
            <Button size="sm">
              <Save style={{ width: 16, height: 16, marginRight: 4 }} />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-area">
          <div
            ref={canvasRef}
            className="canvas-surface"
            style={{ width: canvasWidth, minHeight: '600px', maxWidth: '100%' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => { setSelectedId(null); setRightPanelOpen(false) }}
          >
            {components.length === 0 ? (
              <div className="canvas-empty">
                <div className="canvas-empty-icon">
                  <MousePointer style={{ width: 32, height: 32, color: '#4A5568' }} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem', color: '#E8EAED' }}>Start Building</h3>
                <p style={{ color: '#4A5568', fontSize: '0.875rem', maxWidth: '24rem' }}>
                  Click components in the left panel to add them to your canvas. Drag to position, resize with handles.
                </p>
              </div>
            ) : (
              components.map((comp) => {
                const def = COMPONENTS.find((d) => d.id === comp.componentId)
                if (!def) return null
                const isSelected = selectedId === comp.instanceId

                return (
                  <div
                    key={comp.instanceId}
                    data-canvas-item
                    className={`canvas-item ${isSelected ? 'canvas-item-selected' : 'canvas-item-hover'}`}
                    style={{
                      position: 'absolute',
                      left: comp.x,
                      top: comp.y,
                      width: comp.width,
                      height: comp.height,
                      zIndex: comp.zIndex,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, comp.instanceId, 'move')}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Component render */}
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '4px', pointerEvents: 'none' }}>
                      <RenderComponent component={comp} def={def} isSelected={isSelected} />
                    </div>

                    {/* Selection UI */}
                    {isSelected && (
                      <>
                        {/* Move handle */}
                        <div className="canvas-move-handle">
                          <Move style={{ width: 12, height: 12 }} />
                          {def.name}
                        </div>

                        {/* Resize handle */}
                        <div
                          className="canvas-resize-handle"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            handleMouseDown(e, comp.instanceId, 'resize')
                          }}
                        >
                          <Maximize2 style={{ width: 10, height: 10 }} />
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      {rightPanelOpen && selectedComponent && selectedDef && (
        <div className="canvas-right-panel">
          <div className="canvas-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings style={{ width: 16, height: 16, color: '#7A8290' }} />
              <h2 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#E8EAED' }}>{selectedDef.name}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setRightPanelOpen(false)}>
              <X style={{ width: 16, height: 16 }} />
            </Button>
          </div>

          <Tabs defaultValue="properties" className="canvas-tabs-container">
            <TabsList className="canvas-props-tabs">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="canvas-props-content">
              <PropertyEditor component={selectedComponent} def={selectedDef} onChange={updateProps} />
            </TabsContent>

            <TabsContent value="style" className="canvas-props-content">
              <div className="canvas-props-group">
                <div>
                  <Label>Position</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#4A5568' }}>X</span>
                      <Input
                        type="number"
                        value={Math.round(selectedComponent.x)}
                        onChange={(e) => {
                          setComponents(prev => prev.map(c => c.instanceId === selectedId ? { ...c, x: Number.parseInt(e.target.value) || 0 } : c))
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#4A5568' }}>Y</span>
                      <Input
                        type="number"
                        value={Math.round(selectedComponent.y)}
                        onChange={(e) => {
                          setComponents(prev => prev.map(c => c.instanceId === selectedId ? { ...c, y: Number.parseInt(e.target.value) || 0 } : c))
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Size</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#4A5568' }}>Width</span>
                      <Input
                        type="number"
                        value={Math.round(selectedComponent.width)}
                        onChange={(e) => {
                          setComponents(prev => prev.map(c => c.instanceId === selectedId ? { ...c, width: Number.parseInt(e.target.value) || 100 } : c))
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.625rem', color: '#4A5568' }}>Height</span>
                      <Input
                        type="number"
                        value={Math.round(selectedComponent.height)}
                        onChange={(e) => {
                          setComponents(prev => prev.map(c => c.instanceId === selectedId ? { ...c, height: Number.parseInt(e.target.value) || 50 } : c))
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="canvas-panel-footer">
            <Button variant="outline" size="sm" onClick={duplicateSelected} style={{ width: '100%' }}>
              <Copy style={{ width: 16, height: 16, marginRight: '0.5rem' }} />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteSelected} style={{ width: '100%' }}>
              <Trash2 style={{ width: 16, height: 16, marginRight: '0.5rem' }} />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
