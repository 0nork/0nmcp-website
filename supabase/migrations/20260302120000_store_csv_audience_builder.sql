-- Store Listing: CSV Audience Builder
-- Category: sales | Price: Free | Services: anthropic, crm, google_sheets

INSERT INTO store_listings (
  slug,
  title,
  description,
  long_description,
  category,
  price,
  currency,
  services,
  step_count,
  tags,
  status,
  is_featured,
  workflow_data,
  created_at,
  updated_at
) VALUES (
  'csv-audience-builder',
  'CSV Audience Builder',
  'Turn any contact list into a high-converting Facebook campaign. AI analyzes your CSV to build the perfect audience profile and configure ads automatically.',
  '## CSV Audience Builder

Upload a CSV of contacts and let AI do the heavy lifting — analyze demographics, identify high-value buyer segments, import contacts to your CRM, and deploy a precision-targeted Facebook ad campaign in minutes.

### What''s Included
- Full .0n workflow with 7 automated steps
- AI-powered demographic analysis via Claude
- CRM contact import with automatic tagging
- Facebook Custom Audience creation
- Campaign launch with budget + objective configuration

### Features
- **Smart CSV Parsing** — Reads any contact CSV via Google Sheets API, normalizes columns automatically
- **AI Demographic Analysis** — Claude analyzes names, locations, job titles, and purchase history to build buyer personas
- **Audience Segmentation** — Groups contacts into high/medium/low match tiers for ad targeting
- **CRM Integration** — Imports all contacts with demographic tags, match scores, and campaign association
- **Facebook Campaign Config** — Generates detailed targeting (age, interests, behaviors, lookalike seeds) from your data
- **Custom Audience Upload** — Creates a Facebook Custom Audience from your highest-match contacts
- **One-Click Launch** — Deploys the ad campaign with your budget, region, and objective settings

### Services
- **Anthropic (Claude)** — Demographic analysis, audience profiling, ad copy suggestions
- **CRM** — Contact import, tagging, pipeline management
- **Google Sheets** — CSV parsing and data normalization
- **Facebook Marketing API** — Audience creation, campaign configuration, ad deployment',
  'sales',
  0,
  'usd',
  ARRAY['anthropic', 'crm', 'google_sheets'],
  7,
  ARRAY['csv', 'facebook', 'ads', 'audience', 'targeting', 'demographics', 'campaign', 'contacts', 'crm', 'ai', 'lead-generation', 'marketing'],
  'active',
  true,
  '{
    "$0n": {
      "version": "1.0.0",
      "type": "workflow",
      "created": "2026-03-02T12:00:00Z",
      "name": "CSV Audience Builder",
      "description": "Turn any contact list into a high-converting Facebook campaign. AI analyzes your CSV to build the perfect audience profile and configure ads automatically."
    },
    "trigger": {
      "type": "manual",
      "config": {}
    },
    "inputs": {
      "csv_file_url": {
        "type": "string",
        "description": "URL or Google Sheets ID of the uploaded CSV file",
        "required": true,
        "placeholder": "https://docs.google.com/spreadsheets/d/... or paste CSV data"
      },
      "campaign_budget": {
        "type": "number",
        "description": "Daily campaign budget in USD",
        "required": true,
        "placeholder": "50"
      },
      "target_region": {
        "type": "string",
        "description": "Geographic target area for the campaign",
        "required": true,
        "placeholder": "United States, New York metro area"
      },
      "ad_objective": {
        "type": "select",
        "description": "Facebook campaign objective",
        "required": true,
        "options": ["AWARENESS", "TRAFFIC", "ENGAGEMENT", "LEADS", "CONVERSIONS"],
        "placeholder": "LEADS"
      }
    },
    "launch_codes": {
      "ANTHROPIC_API_KEY": {
        "label": "Anthropic API Key",
        "description": "Claude API key for AI-powered demographic analysis",
        "type": "api_key",
        "required": true,
        "help_url": "https://console.anthropic.com/settings/keys",
        "placeholder": "sk-ant-..."
      },
      "FB_ACCESS_TOKEN": {
        "label": "Facebook Marketing API Token",
        "description": "Long-lived access token for Facebook Ads Manager",
        "type": "api_key",
        "required": true,
        "help_url": "https://developers.facebook.com/tools/explorer/",
        "placeholder": "EAAxxxxxxx..."
      },
      "GOOGLE_SERVICE_ACCOUNT_KEY": {
        "label": "Google Service Account JSON",
        "description": "Service account credentials for Google Sheets API access",
        "type": "json",
        "required": true,
        "help_url": "https://console.cloud.google.com/iam-admin/serviceaccounts",
        "placeholder": "{\"type\": \"service_account\", ...}"
      }
    },
    "steps": [
      {
        "id": "parse_csv",
        "service": "google_sheets",
        "action": "Parse CSV file and extract contact data",
        "description": "Read the uploaded CSV via Google Sheets API. Extract all rows with column headers: name, email, phone, location, job_title, company, age, gender, and any custom fields. Normalize column names and handle missing values.",
        "params": {
          "spreadsheet_id": "{{inputs.csv_file_url}}",
          "range": "A1:Z10000",
          "output_format": "json_rows"
        },
        "on_error": "stop"
      },
      {
        "id": "analyze_demographics",
        "service": "anthropic",
        "action": "AI demographic analysis of contact data",
        "description": "Send the parsed contact data to Claude for deep demographic analysis. Identify patterns in age ranges, geographic clusters, job titles, industries, company sizes, and inferred interests. Generate buyer persona profiles with confidence scores.",
        "params": {
          "model": "claude-sonnet-4-5-20250514",
          "system": "You are a marketing data analyst. Analyze the provided contact list and generate: (1) 2-3 buyer persona profiles with demographics, interests, and behaviors, (2) a match score (0-100) for each contact, (3) recommended Facebook targeting parameters including age range, interests, behaviors, and lookalike audience seeds. Output as structured JSON.",
          "input": "{{step.parse_csv.output}}",
          "max_tokens": 4096
        },
        "on_error": "stop"
      },
      {
        "id": "segment_audience",
        "service": "internal",
        "action": "Build audience profile segments",
        "description": "Group contacts into tiers based on AI match scores: High (80-100), Medium (50-79), Low (0-49). Extract the top persona profile for Facebook targeting. Build the Custom Audience contact list from High + Medium tiers.",
        "params": {
          "transform": "segment_by_score",
          "thresholds": { "high": 80, "medium": 50 },
          "source": "{{step.analyze_demographics.output}}"
        },
        "on_error": "stop"
      },
      {
        "id": "import_to_crm",
        "service": "crm",
        "action": "Import contacts to CRM with tags",
        "description": "Bulk import all contacts to the CRM. Tag each contact with their match tier (high-match, medium-match, low-match), the campaign name, and the primary buyer persona they belong to. Create or update contacts by email address.",
        "params": {
          "contacts": "{{step.parse_csv.output}}",
          "tags": ["csv-audience-builder", "{{step.analyze_demographics.output.primary_persona}}"],
          "match_scores": "{{step.segment_audience.output.scores}}",
          "upsert_by": "email"
        },
        "on_error": "continue"
      },
      {
        "id": "generate_fb_config",
        "service": "anthropic",
        "action": "Generate Facebook campaign configuration",
        "description": "Using the audience analysis, generate a complete Facebook campaign configuration including: detailed targeting (age, gender, interests, behaviors), ad set structure, budget allocation, schedule, and suggested ad copy/headline variations.",
        "params": {
          "model": "claude-sonnet-4-5-20250514",
          "system": "You are a Facebook Ads expert. Given the audience analysis and campaign parameters, generate a complete Facebook campaign configuration as JSON. Include: campaign objective, daily budget, targeting spec (age_min, age_max, genders, geo_locations, interests, behaviors, custom_audiences), ad set schedule, and 3 ad copy variations with headlines.",
          "input": {
            "analysis": "{{step.analyze_demographics.output}}",
            "budget": "{{inputs.campaign_budget}}",
            "region": "{{inputs.target_region}}",
            "objective": "{{inputs.ad_objective}}"
          },
          "max_tokens": 4096
        },
        "on_error": "stop"
      },
      {
        "id": "create_custom_audience",
        "service": "external",
        "action": "Create Facebook Custom Audience",
        "description": "Upload the high-match and medium-match contacts as a Facebook Custom Audience. Uses the FB Marketing API to create a customer list audience from email addresses and phone numbers for precise retargeting.",
        "params": {
          "endpoint": "https://graph.facebook.com/v21.0/act_{ad_account_id}/customaudiences",
          "method": "POST",
          "body": {
            "name": "CSV Audience Builder - {{inputs.target_region}}",
            "subtype": "CUSTOM",
            "customer_file_source": "USER_PROVIDED_ONLY",
            "contacts": "{{step.segment_audience.output.high_and_medium}}"
          },
          "auth": "Bearer {{launch_codes.FB_ACCESS_TOKEN}}"
        },
        "on_error": "stop"
      },
      {
        "id": "launch_campaign",
        "service": "external",
        "action": "Launch Facebook Ad Campaign",
        "description": "Create and launch the Facebook ad campaign using the generated configuration. Sets the campaign live with the specified budget, targeting, and objective. Returns the campaign ID and preview URL for monitoring.",
        "params": {
          "endpoint": "https://graph.facebook.com/v21.0/act_{ad_account_id}/campaigns",
          "method": "POST",
          "body": {
            "name": "CSV Audience Builder Campaign",
            "objective": "{{inputs.ad_objective}}",
            "status": "PAUSED",
            "special_ad_categories": [],
            "targeting": "{{step.generate_fb_config.output.targeting}}",
            "daily_budget": "{{inputs.campaign_budget}}",
            "custom_audience_id": "{{step.create_custom_audience.output.id}}"
          },
          "auth": "Bearer {{launch_codes.FB_ACCESS_TOKEN}}"
        },
        "on_error": "stop"
      }
    ]
  }'::jsonb,
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  workflow_data = EXCLUDED.workflow_data,
  tags = EXCLUDED.tags,
  updated_at = now();
