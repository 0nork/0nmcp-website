-- web0n Site Builder: store generated HTML pages
ALTER TABLE web0n_projects ADD COLUMN IF NOT EXISTS generated_site JSONB;

COMMENT ON COLUMN web0n_projects.generated_site IS 'Generated static HTML pages keyed by filename (index.html, services.html, etc.)';
