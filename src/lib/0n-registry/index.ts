/**
 * 0n Programmatic Website Design Components — Registry
 *
 * A shadcn-compatible registry served from /r/<name>.json on this site.
 * Anyone can `npx shadcn add https://0nmcp.com/r/<name>.json` and install
 * one of our pre-composed branded components into their own project.
 *
 * Each component is its own file under ./components/<name>.ts. This index
 * just imports them and exposes registry helpers.
 */

import { spotlight } from './components/spotlight'
import { flipTile } from './components/flip-tile'
import { pickStrip } from './components/pick-strip'
import { modalBox } from './components/modal-box'
import { bottomPull } from './components/bottom-pull'
import { sideSlider } from './components/side-slider'
import { popBubble } from './components/pop-bubble'
import { dropPick } from './components/drop-pick'
import { gradientHeadline } from './components/gradient-headline'

export type RegistryItemType =
  | 'registry:block'
  | 'registry:component'
  | 'registry:hook'
  | 'registry:ui'

export interface RegistryFile {
  path: string
  type: RegistryItemType
  target: string
  content: string
}

export interface RegistryItem {
  /** Slug used in the URL — `0n-spotlight`, `0n-flip-tile`, etc. */
  name: string
  /** shadcn item type */
  type: RegistryItemType
  /** Human-friendly title shown in our library + shadcn CLI prompts */
  title: string
  description: string
  /** npm packages required */
  dependencies?: string[]
  /** Other shadcn components this depends on (auto-installed) */
  registryDependencies?: string[]
  /** Files written to the user's project on install */
  files: RegistryFile[]
  /** Our internal category — e.g., 'navigation', 'overlay', 'controls' */
  category: string
  /** What you can do with this in plain English */
  useCases: string[]
}

const COMPONENTS: RegistryItem[] = [
  spotlight,
  flipTile,
  pickStrip,
  modalBox,
  bottomPull,
  sideSlider,
  popBubble,
  dropPick,
  gradientHeadline,
]

const COMPONENTS_BY_NAME = new Map(COMPONENTS.map((c) => [c.name, c]))

export function listRegistry(): RegistryItem[] {
  return COMPONENTS
}

export function getRegistryItem(name: string): RegistryItem | undefined {
  return COMPONENTS_BY_NAME.get(name)
}

/**
 * Serialize a registry item to the shadcn-compatible JSON the CLI expects.
 * The shadcn CLI fetches this and writes the files into the user's project.
 */
export function toShadcnItemJson(item: RegistryItem) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies ?? [],
    registryDependencies: item.registryDependencies ?? [],
    files: item.files,
  }
}

/**
 * Serialize the full registry index — what shadcn calls `registry.json`.
 * Public consumers can fetch this to discover what's available.
 */
export function toShadcnRegistryJson() {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: '0n',
    homepage: 'https://0nmcp.com/programmatic-design',
    items: COMPONENTS.map((item) => ({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      files: item.files.map((f) => ({ path: f.path, type: f.type, target: f.target })),
      // 0n extensions (non-standard but harmless)
      _0n: {
        category: item.category,
        useCases: item.useCases,
      },
    })),
  }
}

/**
 * Public-facing summary used by /programmatic-design and the 0nMCP tools.
 * Strips the source code blobs to keep payloads small.
 */
export function toPublicSummary() {
  return {
    name: '0n',
    title: '0n — Programmatic Website Design Components',
    homepage: 'https://0nmcp.com/programmatic-design',
    install_pattern: 'npx shadcn@latest add https://0nmcp.com/r/<name>.json',
    items: COMPONENTS.map((item) => ({
      name: item.name,
      title: item.title,
      description: item.description,
      category: item.category,
      useCases: item.useCases,
      install_command: `npx shadcn@latest add https://0nmcp.com/r/${item.name}.json`,
      preview_url: `https://0nmcp.com/library#${item.name}`,
      registry_url: `https://0nmcp.com/r/${item.name}.json`,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
    })),
    totals: {
      items: COMPONENTS.length,
      categories: Array.from(new Set(COMPONENTS.map((c) => c.category))).length,
    },
  }
}
