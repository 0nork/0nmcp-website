-- Migration: 20260301000000_vault_files_brand.sql
-- Purpose: Universal vault file storage + brand template store listing

-- ============================================================================
-- 1. user_vault_files — Universal .0n file storage with categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_vault_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'workflow',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  file_data JSONB NOT NULL,
  source TEXT DEFAULT 'manual',
  source_id TEXT,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  icon TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_vault_files ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "vault_files_own_read" ON public.user_vault_files FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "vault_files_own_insert" ON public.user_vault_files FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "vault_files_own_update" ON public.user_vault_files FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "vault_files_own_delete" ON public.user_vault_files FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "vault_files_service_all" ON public.user_vault_files FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_vault_files_user ON public.user_vault_files(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_files_type ON public.user_vault_files(file_type);
CREATE INDEX IF NOT EXISTS idx_vault_files_category ON public.user_vault_files(category);
CREATE INDEX IF NOT EXISTS idx_vault_files_user_type ON public.user_vault_files(user_id, file_type);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_vault_file_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_vault_file_updated ON public.user_vault_files;
CREATE TRIGGER set_vault_file_updated
  BEFORE UPDATE ON public.user_vault_files
  FOR EACH ROW
  EXECUTE FUNCTION update_vault_file_timestamp();

-- ============================================================================
-- 2. Seed: Brand Identity .0n Template store listing
-- ============================================================================

INSERT INTO store_listings (
  title,
  slug,
  description,
  long_description,
  category,
  tags,
  price,
  currency,
  services,
  step_count,
  status,
  workflow_data
) VALUES (
  '0nMCP Brand Identity Kit',
  'brand-identity-kit',
  'Complete brand identity .0n file with colors, typography, logos, gradients, and style tokens. Use as a template for your own brand or reference the 0nMCP brand system.',
  E'## Brand Identity .0n File\n\nA portable brand identity file in the .0n standard format. Contains everything an AI needs to maintain consistent branding across all projects.\n\n### What''s Included\n\n- **Colors**: Primary, secondary, tertiary accents with dim/glow variants\n- **Backgrounds**: Dark theme palette (primary, secondary, tertiary, card)\n- **Typography**: Display and monospace font stacks with weight ranges\n- **Logos**: All logo variation references (icon + full logo in multiple colors)\n- **Gradients**: Pre-built gradient combos for buttons, text, backgrounds\n- **Style Tokens**: Border colors, border radius, shadows, spacing\n- **Usage Rules**: Do''s and don''ts for brand application\n\n### Use Cases\n\n- Drop into any AI chat to maintain brand consistency\n- Import into the 0n Builder for branded workflows\n- Reference in .0n SWITCH files for branded outputs\n- Share with team members or AI agents\n- Use as a starting template for your own brand file\n\n### File Type: brand\nThis is a `.0n` brand file — one of the many file types supported by the 0n Standard.',
  'template',
  ARRAY['brand', 'identity', 'colors', 'typography', 'design', 'template', 'style', 'free'],
  0,
  'usd',
  ARRAY[]::TEXT[],
  0,
  'active',
  '{
    "$0n": {
      "version": "1.0.0",
      "type": "brand",
      "created": "2026-02-28T00:00:00.000Z",
      "name": "0nMCP Brand Identity Kit",
      "description": "Complete brand identity system for the 0nMCP platform. Colors, typography, logos, gradients, and style tokens."
    },
    "brand": {
      "name": "0nMCP",
      "tagline": "Stop building workflows. Start describing outcomes.",
      "subtitle": "Agentic Automation",
      "owner": "RocketOpp LLC",
      "website": "https://0nmcp.com"
    },
    "colors": {
      "primary": {
        "hex": "#7ed957",
        "rgb": "rgb(126, 217, 87)",
        "name": "0n Green",
        "usage": "Primary accent, CTAs, active states, links, highlights"
      },
      "primary_dim": {
        "hex": "#5cb83a",
        "rgb": "rgb(92, 184, 58)",
        "usage": "Hover states, secondary emphasis, borders"
      },
      "primary_glow": {
        "rgba": "rgba(126, 217, 87, 0.15)",
        "usage": "Background tints, glows, subtle emphasis"
      },
      "secondary": {
        "hex": "#00d4ff",
        "rgb": "rgb(0, 212, 255)",
        "name": "0n Cyan",
        "usage": "Secondary accent, info states, gradient endpoints"
      },
      "tertiary": {
        "hex": "#a78bfa",
        "rgb": "rgb(167, 139, 250)",
        "name": "0n Purple",
        "usage": "Tertiary accent, premium indicators, gradient mix"
      },
      "orange": {
        "hex": "#ff6b35",
        "rgb": "rgb(255, 107, 53)",
        "name": "RocketOpp Orange",
        "usage": "Warning states, CRM service color, patent indicators"
      }
    },
    "backgrounds": {
      "primary": "#0a0a0f",
      "secondary": "#111118",
      "tertiary": "#16161f",
      "card": "#1a1a25"
    },
    "text": {
      "primary": "#e8e8ef",
      "secondary": "#8888a0",
      "muted": "#55556a"
    },
    "borders": {
      "default": "#2a2a3a",
      "hover": "#3a3a50"
    },
    "typography": {
      "display": {
        "family": "Instrument Sans",
        "fallback": "system-ui, -apple-system, sans-serif",
        "weights": [400, 500, 600, 700],
        "usage": "Headlines, titles, navigation, body text"
      },
      "mono": {
        "family": "JetBrains Mono",
        "fallback": "Menlo, Monaco, monospace",
        "weights": [400, 500, 700],
        "usage": "Code, terminal, stats, technical labels"
      }
    },
    "logos": {
      "icon_green": "/brand/icon-green.png",
      "icon_black": "/brand/icon-black.png",
      "icon_white": "/brand/icon-white.png",
      "full_color": "/brand/logo-full.jpg",
      "full_black": "/brand/logo-black.png",
      "full_white": "/brand/logo-white.png",
      "usage": {
        "dark_backgrounds": "logo-white.png or icon-white.png",
        "light_backgrounds": "logo-black.png or icon-black.png",
        "marketing": "logo-full.jpg (on black background)",
        "favicon": "icon-green.png (scaled to 32x32 or 16x16)"
      }
    },
    "gradients": {
      "primary": "linear-gradient(135deg, #7ed957, #5cb83a)",
      "green_to_cyan": "linear-gradient(135deg, #7ed957, #00d4ff)",
      "full_spectrum": "linear-gradient(135deg, #7ed957 0%, #00d4ff 50%, #a78bfa 100%)",
      "hero_text": "linear-gradient(135deg, #7ed957 0%, #00d4ff 50%, #a78bfa 100%)",
      "card_hover": "linear-gradient(135deg, rgba(126, 217, 87, 0.1), rgba(0, 212, 255, 0.05))",
      "dark_bg": "linear-gradient(135deg, #0a0a0f 0%, #111118 100%)"
    },
    "style_tokens": {
      "border_radius": {
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "24px",
        "full": "9999px"
      },
      "shadow": {
        "glow_sm": "0 0 10px rgba(126, 217, 87, 0.15)",
        "glow_md": "0 0 20px rgba(126, 217, 87, 0.15), 0 4px 16px rgba(126, 217, 87, 0.2)",
        "glow_lg": "0 0 30px rgba(126, 217, 87, 0.15), 0 0 60px rgba(126, 217, 87, 0.1)",
        "card": "0 4px 16px rgba(0, 0, 0, 0.3)"
      }
    },
    "rules": {
      "dos": [
        "Use primary green for all interactive elements and CTAs",
        "Use dark backgrounds exclusively — this is a dark-first brand",
        "Use mono font for technical content, stats, and code",
        "Use gradients for premium/featured elements",
        "Maintain high contrast between text and backgrounds"
      ],
      "donts": [
        "Never use light/white backgrounds for main content areas",
        "Never use the green on light backgrounds without sufficient contrast",
        "Never stretch or distort the logo",
        "Never use colors outside the defined palette for UI elements",
        "Never use serif fonts"
      ]
    }
  }'::JSONB
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3. Reload PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';
