-- Add unique constraint for Google Drive sync upsert support
ALTER TABLE service_knowledge ADD CONSTRAINT uq_sk_service_title UNIQUE (service_key, title);
