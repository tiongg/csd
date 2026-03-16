-- Notification type enum
CREATE TYPE notification_type AS ENUM (
    'CONTRIBUTOR_APPLIED',
    'COURSE_AWAITING_REVIEW',
    'TEAM_INVITATION',
    'COURSE_APPROVED'
);

-- Notifications table
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts.account(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    item_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_notification_account ON notification(account_id);
CREATE INDEX idx_notification_account_unread ON notification(account_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notification_created_at ON notification(created_at DESC);
