'use client'

import { useState } from 'react'
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Heart,
  Mail,
  MoreHorizontal,
  Search,
  Settings,
  Star,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Toaster, toast } from 'sonner'
import RegistryBrowser from './RegistryBrowser'

// ────────────────────────────────────────────────────────────────────
// 0n FRIENDLY NAME REGISTRY
// Each building block has a unique 0n-friendly name and plain-English
// description. No code/library references on the public surface.
// ────────────────────────────────────────────────────────────────────

interface Block {
  name: string // 0n friendly name — unique across the library
  description: string
  preview: React.ReactNode
}

interface Category {
  slug: string
  label: string // category 0n name
  intro: string
  blocks: Block[]
}

// ── Live preview helpers (kept tiny) ─────────────────────────────────

function PreviewBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-border/40 bg-background/40 p-6">
      {children}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// CATEGORY DEFINITIONS
// ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  // ─── TRIGGERS ─────────────────────────────────────────────────────
  {
    slug: 'triggers',
    label: 'Triggers',
    intro: 'Things people press, tap, or flip to make something happen.',
    blocks: [
      {
        name: 'Tap',
        description: 'A simple call to action. Used wherever someone needs to commit, confirm, or move forward.',
        preview: (
          <PreviewBox>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button>Continue</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="ghost">Maybe later</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Flip Tile',
        description: 'A two-state square that someone presses to mark a single option active or inactive.',
        preview: (
          <PreviewBox>
            <ToggleDemo />
          </PreviewBox>
        ),
      },
      {
        name: 'Pick Strip',
        description: 'A row of two-state tiles where someone picks one or several options at once.',
        preview: (
          <PreviewBox>
            <ToggleGroupDemo />
          </PreviewBox>
        ),
      },
    ],
  },

  // ─── INPUTS ───────────────────────────────────────────────────────
  {
    slug: 'inputs',
    label: 'Inputs',
    intro: 'How people give us information — typing, picking, sliding, scheduling.',
    blocks: [
      {
        name: 'Type Field',
        description: 'A single line for typed information — names, emails, search queries.',
        preview: (
          <PreviewBox>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="lib-type-field">Email</Label>
              <Input id="lib-type-field" type="email" placeholder="you@company.com" />
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Long Note',
        description: 'A multi-line area for paragraphs, comments, and longer thoughts.',
        preview: (
          <PreviewBox>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="lib-note">Tell us more</Label>
              <Textarea id="lib-note" placeholder="Anything we should know?" rows={3} />
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Caption Tag',
        description: 'A short label that names what an input is for and links it to assistive tech.',
        preview: (
          <PreviewBox>
            <div className="flex items-center gap-3">
              <Label htmlFor="lib-cap">Workspace name</Label>
              <Input id="lib-cap" placeholder="Acme Inc." className="max-w-[200px]" />
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Check Square',
        description: 'A small square for marking single items as included or excluded.',
        preview: (
          <PreviewBox>
            <div className="flex items-center gap-2">
              <Checkbox id="lib-check" defaultChecked />
              <Label htmlFor="lib-check" className="cursor-pointer">
                Subscribe to product updates
              </Label>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'One Choice',
        description: 'A small group where exactly one option is active at a time.',
        preview: (
          <PreviewBox>
            <RadioGroup defaultValue="monthly" className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="lib-radio-m" value="monthly" />
                <Label htmlFor="lib-radio-m">Monthly</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="lib-radio-y" value="yearly" />
                <Label htmlFor="lib-radio-y">Yearly</Label>
              </div>
            </RadioGroup>
          </PreviewBox>
        ),
      },
      {
        name: 'On-Off',
        description: 'A sliding bar for turning a single setting on or off — common in preferences and settings.',
        preview: (
          <PreviewBox>
            <div className="flex items-center gap-3">
              <Switch id="lib-switch" defaultChecked />
              <Label htmlFor="lib-switch" className="cursor-pointer">
                Email notifications
              </Label>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Drop Pick',
        description: 'A compact menu that opens to reveal options to choose from.',
        preview: (
          <PreviewBox>
            <DropPickDemo />
          </PreviewBox>
        ),
      },
      {
        name: 'Slide Knob',
        description: 'A draggable handle on a track for picking a value in a range.',
        preview: (
          <PreviewBox>
            <div className="w-full max-w-xs">
              <Slider defaultValue={[60]} max={100} step={1} />
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Code Slots',
        description: 'A row of digit boxes for entering verification codes and one-time passwords.',
        preview: (
          <PreviewBox>
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </PreviewBox>
        ),
      },
      {
        name: 'Day Picker',
        description: 'A calendar grid for selecting a date or a date range.',
        preview: (
          <PreviewBox>
            <Calendar mode="single" className="rounded-md border" />
          </PreviewBox>
        ),
      },
    ],
  },

  // ─── CONTAINERS ───────────────────────────────────────────────────
  {
    slug: 'containers',
    label: 'Containers',
    intro: 'How information is grouped, framed, and organized on a page.',
    blocks: [
      {
        name: 'Card Tile',
        description: 'A bordered surface that groups a title, body, and optional action together.',
        preview: (
          <PreviewBox>
            <Card className="w-[260px]">
              <CardHeader>
                <CardTitle>Daily Digest</CardTitle>
                <CardDescription>3 new updates this morning</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                A short summary of recent activity across your workspace.
              </CardContent>
            </Card>
          </PreviewBox>
        ),
      },
      {
        name: 'Line Break',
        description: 'A thin line that visually separates two groups of content.',
        preview: (
          <PreviewBox>
            <div className="w-full max-w-xs">
              <p className="text-sm">Section above</p>
              <Separator className="my-3" />
              <p className="text-sm">Section below</p>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Frame Lock',
        description: 'A box that keeps its width-to-height proportions — used for video thumbnails and product images.',
        preview: (
          <PreviewBox>
            <div className="w-full max-w-[260px]">
              <div className="aspect-video overflow-hidden rounded-md bg-gradient-to-br from-[#6EE05A]/30 via-[#14b8a6]/30 to-[#a78bfa]/30">
                <div className="flex h-full w-full items-center justify-center text-xs font-mono text-white/70">
                  16 : 9
                </div>
              </div>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Scroll Box',
        description: 'A bounded region that scrolls its contents when they overflow.',
        preview: (
          <PreviewBox>
            <ScrollArea className="h-[120px] w-[280px] rounded-md border p-3">
              <div className="space-y-2 text-sm text-white/70">
                {Array.from({ length: 12 }).map((_, i) => (
                  <p key={i}>Item {i + 1} — keeps going as you scroll.</p>
                ))}
              </div>
            </ScrollArea>
          </PreviewBox>
        ),
      },
    ],
  },

  // ─── OVERLAYS ─────────────────────────────────────────────────────
  {
    slug: 'overlays',
    label: 'Overlays',
    intro: 'Surfaces that float above the page to surface information without leaving where you are.',
    blocks: [
      {
        name: 'Modal Box',
        description: 'A focused window that opens over the page for tasks that need full attention.',
        preview: (
          <PreviewBox>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open the modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>You&rsquo;re about to do a thing</DialogTitle>
                  <DialogDescription>
                    A focused space for short tasks. Closes on Esc or by clicking outside.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </PreviewBox>
        ),
      },
      {
        name: 'Confirm Modal',
        description: 'A small window that double-checks before something destructive or irreversible happens.',
        preview: (
          <PreviewBox>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete project</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone. All workflows and history will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </PreviewBox>
        ),
      },
      {
        name: 'Bottom Pull',
        description: 'A panel that slides up from the bottom — natural on phones and small screens.',
        preview: (
          <PreviewBox>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Open the bottom pull</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Quick actions</DrawerTitle>
                  <DrawerDescription>
                    Best for mobile flows where the keyboard is involved.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button>Done</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </PreviewBox>
        ),
      },
      {
        name: 'Side Slider',
        description: 'A panel that slides in from any edge of the screen — great for filters and inspectors.',
        preview: (
          <PreviewBox>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open the side slider</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow what you&rsquo;re looking at without losing your place.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </PreviewBox>
        ),
      },
      {
        name: 'Pop Bubble',
        description: 'A small floating panel anchored to whatever you press to open it.',
        preview: (
          <PreviewBox>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Pick a day
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          </PreviewBox>
        ),
      },
      {
        name: 'Quick Tip',
        description: 'A tiny floating label that appears on hover or focus to explain an icon or button.',
        preview: (
          <PreviewBox>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PreviewBox>
        ),
      },
      {
        name: 'Hover Preview',
        description: 'A larger floating card with rich content that opens when you hover an item.',
        preview: (
          <PreviewBox>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" className="px-2 text-[#6EE05A] underline-offset-4 hover:underline">@mike</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">Mike Mento</p>
                    <p className="text-xs text-muted-foreground">Founder, RocketOpp LLC</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </PreviewBox>
        ),
      },
      {
        name: 'Right-Click Menu',
        description: 'A menu that appears wherever someone right-clicks — used for in-place actions.',
        preview: (
          <PreviewBox>
            <ContextMenu>
              <ContextMenuTrigger className="flex h-[80px] w-[260px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Right-click anywhere here
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Open</ContextMenuItem>
                <ContextMenuItem>Rename</ContextMenuItem>
                <ContextMenuItem>Duplicate</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </PreviewBox>
        ),
      },
      {
        name: 'Dropdown List',
        description: 'A list of choices that opens beneath a button, often with section headers.',
        preview: (
          <PreviewBox>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Account <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Mike Mento</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PreviewBox>
        ),
      },
      {
        name: 'Spotlight',
        description: 'A keyboard-driven search palette that lets people jump anywhere in the app instantly.',
        preview: (
          <PreviewBox>
            <SpotlightDemo />
          </PreviewBox>
        ),
      },
    ],
  },

  // ─── NAVIGATION ───────────────────────────────────────────────────
  {
    slug: 'navigation',
    label: 'Navigation',
    intro: 'How people move between sections, pages, and views.',
    blocks: [
      {
        name: 'Tab Group',
        description: 'A row of named sections where pressing one swaps the content shown beneath.',
        preview: (
          <PreviewBox>
            <Tabs defaultValue="overview" className="w-[320px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
                Summary of your workspace.
              </TabsContent>
              <TabsContent value="usage" className="pt-3 text-sm text-muted-foreground">
                Tools called this month.
              </TabsContent>
              <TabsContent value="billing" className="pt-3 text-sm text-muted-foreground">
                Plan, invoices, payment method.
              </TabsContent>
            </Tabs>
          </PreviewBox>
        ),
      },
      {
        name: 'Crumb Trail',
        description: 'A line of clickable steps that shows where you are and how to walk back up.',
        preview: (
          <PreviewBox>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>0nMCP Site</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </PreviewBox>
        ),
      },
      {
        name: 'Page Steps',
        description: 'Numbered controls for moving through a long list one page at a time.',
        preview: (
          <PreviewBox>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </PreviewBox>
        ),
      },
    ],
  },

  // ─── FEEDBACK ─────────────────────────────────────────────────────
  {
    slug: 'feedback',
    label: 'Feedback',
    intro: 'How the system tells you what just happened, what is loading, or what is wrong.',
    blocks: [
      {
        name: 'Alert Banner',
        description: 'A boxed message that calls attention to something important on the current page.',
        preview: (
          <PreviewBox>
            <Alert className="w-[320px]">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>Your trial ends in 3 days. Pick a plan to keep going.</AlertDescription>
            </Alert>
          </PreviewBox>
        ),
      },
      {
        name: 'Status Chip',
        description: 'A small pill with a label or count — used for tags, statuses, and badges.',
        preview: (
          <PreviewBox>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Live</Badge>
              <Badge variant="secondary">Draft</Badge>
              <Badge variant="outline">Beta</Badge>
              <Badge variant="destructive">Failed</Badge>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Loading Shimmer',
        description: 'A gentle animated placeholder used while the real content is on its way.',
        preview: (
          <PreviewBox>
            <div className="w-full max-w-[280px] space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Toast Pop',
        description: 'A small message that appears in a corner to confirm an action and disappears on its own.',
        preview: (
          <PreviewBox>
            <ToastDemo />
          </PreviewBox>
        ),
      },
    ],
  },

  // ─── DISPLAY ──────────────────────────────────────────────────────
  {
    slug: 'display',
    label: 'Display',
    intro: 'How structured information — people, rows, cycles — gets shown beautifully.',
    blocks: [
      {
        name: 'Profile Icon',
        description: 'A circular space for a person&rsquo;s photo, with a clean fallback when there isn&rsquo;t one.',
        preview: (
          <PreviewBox>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JK</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-[#6EE05A] text-black">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </PreviewBox>
        ),
      },
      {
        name: 'Data Table',
        description: 'A grid of rows and columns for showing structured records side by side.',
        preview: (
          <PreviewBox>
            <Table className="w-full max-w-[420px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Supporter</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell className="text-right">$8</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Builder</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell className="text-right">$80</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enterprise</TableCell>
                  <TableCell>Unlimited</TableCell>
                  <TableCell className="text-right">Custom</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </PreviewBox>
        ),
      },
      {
        name: 'Slide Cycle',
        description: 'A horizontal track that pages through cards, photos, or quotes one at a time.',
        preview: (
          <PreviewBox>
            <Carousel className="w-[260px]">
              <CarouselContent>
                {['One', 'Two', 'Three'].map((label) => (
                  <CarouselItem key={label}>
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center text-3xl font-black text-[#6EE05A]">
                        {label}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </PreviewBox>
        ),
      },
      {
        name: 'Single Fold',
        description: 'A single section that quietly shows or hides its content with a press.',
        preview: (
          <PreviewBox>
            <Collapsible className="w-[280px] space-y-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Show extra options
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="rounded-md border border-border/40 bg-card/40 p-3 text-sm text-muted-foreground">
                Tucked-away controls that don&rsquo;t need to be visible all the time.
              </CollapsibleContent>
            </Collapsible>
          </PreviewBox>
        ),
      },
      {
        name: 'Multi Fold',
        description: 'A stack of foldable sections — used for FAQs, settings, and grouped detail pages.',
        preview: (
          <PreviewBox>
            <Accordion type="single" collapsible className="w-[320px]">
              <AccordionItem value="a1">
                <AccordionTrigger>Why use 0n?</AccordionTrigger>
                <AccordionContent>One install gets you 1,562 tools across 97 services.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="a2">
                <AccordionTrigger>Is it free?</AccordionTrigger>
                <AccordionContent>The core orchestrator is MIT licensed and free forever.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </PreviewBox>
        ),
      },
    ],
  },
]

// ── Tiny stateful demos kept out of the data block ───────────────────

function DropPickDemo() {
  const [value, setValue] = useState('builder')
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Choose a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="supporter">Supporter</SelectItem>
        <SelectItem value="builder">Builder</SelectItem>
        <SelectItem value="enterprise">Enterprise</SelectItem>
      </SelectContent>
    </Select>
  )
}

function ToggleDemo() {
  const [on, setOn] = useState(false)
  return (
    <Button
      variant={on ? 'default' : 'outline'}
      size="icon"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
    >
      <Heart className={on ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
    </Button>
  )
}

function ToggleGroupDemo() {
  const [picks, setPicks] = useState<string[]>(['bold'])
  const has = (k: string) => picks.includes(k)
  const flip = (k: string) =>
    setPicks((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-card/60 p-1">
      {['bold', 'italic', 'star'].map((k) => (
        <Button
          key={k}
          size="icon"
          variant={has(k) ? 'default' : 'ghost'}
          onClick={() => flip(k)}
          aria-pressed={has(k)}
        >
          {k === 'bold' && <span className="font-black">B</span>}
          {k === 'italic' && <span className="italic font-serif">I</span>}
          {k === 'star' && <Star className="h-4 w-4" />}
        </Button>
      ))}
    </div>
  )
}

function SpotlightDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" /> Open Spotlight
        <kbd className="ml-3 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-md">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Jump to anything…"
              className="border-0 bg-transparent focus-visible:ring-0 px-0"
            />
          </div>
          <div className="p-2 text-sm">
            <div className="px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Suggestions
            </div>
            {[
              { icon: Mail, label: 'Compose new message' },
              { icon: User, label: 'Open your profile' },
              { icon: Settings, label: 'Change settings' },
              { icon: Check, label: 'Mark all as done' },
            ].map((i) => (
              <button
                key={i.label}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted/50"
              >
                <i.icon className="h-4 w-4 text-muted-foreground" />
                <span>{i.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ToastDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast('Saved your changes', {
          description: 'Your settings are live.',
        })
      }
    >
      Show a toast pop
    </Button>
  )
}

// ────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────────────

export default function LibraryClient() {
  const totalBlocks = CATEGORIES.reduce((sum, c) => sum + c.blocks.length, 0)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster richColors />

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8 lg:pt-36 lg:pb-16">
          <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
            The 0n Library
          </Badge>
          <h1 className="text-balance text-5xl font-black tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              Every building block in the 0n design system.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            One library. {totalBlocks} live building blocks across {CATEGORIES.length} categories.
            Every product surface in the 0n ecosystem is composed from this same set.
          </p>
        </div>
      </section>

      {/* ── Body: sticky sidebar + scrolling preview list ──── */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-16">
        {/* Left: category nav */}
        <aside className="lg:col-span-3">
          <nav className="sticky top-24">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Categories
            </p>
            <ul className="space-y-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`#${c.slug}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-card/60 hover:text-[#6EE05A]"
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {c.blocks.length}
                    </span>
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#registry"
                  className="flex items-center justify-between rounded-md border border-[#a78bfa]/25 bg-[#a78bfa]/5 px-3 py-2 text-sm font-bold text-[#a78bfa] transition-colors hover:bg-[#a78bfa]/10"
                >
                  <span>Full Registry</span>
                  <span className="font-mono text-[10px]">7,732</span>
                </a>
              </li>
            </ul>
            <Separator className="my-6" />
            <p className="px-3 text-xs leading-relaxed text-muted-foreground">
              Built with one consistent system across every 0n product. Press a name to jump.
            </p>
          </nav>
        </aside>

        {/* Right: live previews */}
        <div className="space-y-16 lg:col-span-9">
          {/* Curated 39 — Core blocks with live previews */}
          <div>
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#6EE05A]">
                  Core Blocks · Curated
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-white">
                  The {totalBlocks} live primitives every 0n surface uses
                </h2>
              </div>
            </div>
          </div>
          {CATEGORIES.map((cat) => (
            <section key={cat.slug} id={cat.slug} className="scroll-mt-24">
              <div className="mb-6 border-b border-border/60 pb-4">
                <h2 className="text-3xl font-black tracking-tight">
                  <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                    {cat.label}
                  </span>
                </h2>
                <p className="mt-2 text-sm text-white/65">{cat.intro}</p>
              </div>

              <div className="space-y-6">
                {cat.blocks.map((b) => (
                  <Card
                    key={b.name}
                    className="border-border/60 bg-card/40 backdrop-blur transition-colors hover:border-[#6EE05A]/30"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl text-white">{b.name}</CardTitle>
                          <CardDescription className="mt-1 text-white/65">
                            {b.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
                          {cat.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>{b.preview}</CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          {/* ── Full registry — 7,732 blocks across 56 categories ── */}
          <section id="registry" className="scroll-mt-24">
            <div className="mb-6 border-b border-border/60 pb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a78bfa]">
                Full Registry · Live · 7,732 blocks
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  Every block in the wider design ecosystem.
                </span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/65">
                Live-pulled from the open community registry. Browse 56 categories, open one to see
                its blocks. Each card opens the full preview in a new tab and includes the install
                command for direct adoption.
              </p>
            </div>

            <RegistryBrowser />
          </section>
        </div>
      </div>
    </main>
  )
}
