-- Admin To-Do List + Notification System
-- Tasks with urgency, due dates, file attachments, and CRM sync

CREATE TABLE IF NOT EXISTS admin_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  urgency REAL DEFAULT 0.0,  -- 0.0 (cool) to 1.0 (HOT)
  due_date TIMESTAMPTZ,
  file_url TEXT,
  file_name TEXT,
  crm_task_id TEXT,          -- synced CRM task ID
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON admin_todos FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_admin_todos_user ON admin_todos(user_id);
CREATE INDEX idx_admin_todos_due ON admin_todos(due_date) WHERE completed = FALSE;
CREATE INDEX idx_admin_todos_notify ON admin_todos(notified, due_date) WHERE completed = FALSE AND notified = FALSE;

-- Notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'todo_due',  -- todo_due, todo_overdue, system
  title TEXT NOT NULL,
  body TEXT,
  todo_id UUID REFERENCES admin_todos(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON admin_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_notifications_user_unread ON admin_notifications(user_id, read) WHERE read = FALSE;
