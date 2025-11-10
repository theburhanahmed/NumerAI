-- NumerAI Database Schema
-- PostgreSQL 14+
-- Version: 1.0
-- Date: November 10, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS & AUTHENTICATION
-- =============================================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    location VARCHAR(255),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    
    -- Status flags
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Premium subscription
    premium_expiry TIMESTAMP,
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('free', 'basic', 'premium', 'elite')),
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_premium ON users(is_premium) WHERE is_premium = TRUE;

-- OTP codes table
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'phone')),
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT otp_max_attempts CHECK (attempts <= 3)
);

-- Indexes for otp_codes table
CREATE INDEX idx_otp_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_expires_at ON otp_codes(expires_at);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for refresh_tokens table
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id, expires_at DESC);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =============================================================================
-- NUMEROLOGY
-- =============================================================================

-- Numerology profiles table
CREATE TABLE numerology_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core numbers
    life_path_number INTEGER NOT NULL CHECK (life_path_number BETWEEN 1 AND 33),
    destiny_number INTEGER NOT NULL CHECK (destiny_number BETWEEN 1 AND 33),
    soul_urge_number INTEGER NOT NULL CHECK (soul_urge_number BETWEEN 1 AND 33),
    personality_number INTEGER NOT NULL CHECK (personality_number BETWEEN 1 AND 33),
    attitude_number INTEGER NOT NULL CHECK (attitude_number BETWEEN 1 AND 33),
    maturity_number INTEGER NOT NULL CHECK (maturity_number BETWEEN 1 AND 33),
    balance_number INTEGER NOT NULL CHECK (balance_number BETWEEN 1 AND 33),
    personal_year_number INTEGER NOT NULL CHECK (personal_year_number BETWEEN 1 AND 9),
    personal_month_number INTEGER NOT NULL CHECK (personal_month_number BETWEEN 1 AND 9),
    
    -- Advanced features (Phase 2)
    lo_shu_grid JSONB,
    karmic_lessons INTEGER[],
    karmic_debts INTEGER[],
    
    -- Metadata
    calculation_system VARCHAR(20) DEFAULT 'pythagorean' CHECK (calculation_system IN ('pythagorean', 'chaldean')),
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for numerology_profiles table
CREATE INDEX idx_numerology_user_id ON numerology_profiles(user_id);
CREATE INDEX idx_numerology_life_path ON numerology_profiles(life_path_number);

-- Daily readings table (partitioned by month)
CREATE TABLE daily_readings (
    id UUID DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    
    -- Reading content
    personal_day_number INTEGER NOT NULL CHECK (personal_day_number BETWEEN 1 AND 9),
    lucky_number INTEGER NOT NULL,
    lucky_color VARCHAR(50) NOT NULL,
    auspicious_time VARCHAR(50) NOT NULL,
    activity_recommendation TEXT NOT NULL,
    warning TEXT NOT NULL,
    affirmation TEXT NOT NULL,
    actionable_tip TEXT NOT NULL,
    
    -- Metadata
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP,
    is_shared BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    PRIMARY KEY (id, reading_date),
    UNIQUE (user_id, reading_date)
) PARTITION BY RANGE (reading_date);

-- Create partitions for daily_readings (2025)
CREATE TABLE daily_readings_2025_01 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE daily_readings_2025_02 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE daily_readings_2025_03 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE daily_readings_2025_04 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE daily_readings_2025_05 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE daily_readings_2025_06 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE daily_readings_2025_07 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE daily_readings_2025_08 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE daily_readings_2025_09 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE daily_readings_2025_10 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE daily_readings_2025_11 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE daily_readings_2025_12 PARTITION OF daily_readings
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Indexes for daily_readings partitions
CREATE INDEX idx_daily_readings_user_date ON daily_readings(user_id, reading_date DESC);
CREATE INDEX idx_daily_readings_date ON daily_readings(reading_date DESC);

-- =============================================================================
-- AI CHAT
-- =============================================================================

-- AI conversations table
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Indexes for ai_conversations table
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, started_at DESC);
CREATE INDEX idx_ai_conversations_active ON ai_conversations(user_id, is_active) WHERE is_active = TRUE;

-- AI messages table (partitioned by conversation hash)
CREATE TABLE ai_messages (
    id UUID DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, conversation_id)
) PARTITION BY HASH (conversation_id);

-- Create 8 partitions for ai_messages
CREATE TABLE ai_messages_0 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 0);

CREATE TABLE ai_messages_1 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 1);

CREATE TABLE ai_messages_2 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 2);

CREATE TABLE ai_messages_3 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 3);

CREATE TABLE ai_messages_4 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 4);

CREATE TABLE ai_messages_5 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 5);

CREATE TABLE ai_messages_6 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 6);

CREATE TABLE ai_messages_7 PARTITION OF ai_messages
    FOR VALUES WITH (MODULUS 8, REMAINDER 7);

-- Indexes for ai_messages partitions
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at ASC);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- Device tokens table
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fcm_token VARCHAR(500) NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for device_tokens table
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_fcm ON device_tokens(fcm_token);
CREATE INDEX idx_device_tokens_active ON device_tokens(user_id, is_active) WHERE is_active = TRUE;

-- Notification settings table
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification preferences
    daily_reading_enabled BOOLEAN DEFAULT TRUE,
    weekly_prediction_enabled BOOLEAN DEFAULT TRUE,
    ai_chat_enabled BOOLEAN DEFAULT TRUE,
    marketing_enabled BOOLEAN DEFAULT FALSE,
    
    -- Timing preferences
    time_preference TIME DEFAULT '07:00:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    -- Do not disturb
    dnd_start_time TIME,
    dnd_end_time TIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notification_settings table
CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);

-- Notification history table
CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
    
    -- Notification details
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    
    -- Delivery status
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked')),
    error_message TEXT,
    
    -- Timestamps
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notification_history table
CREATE INDEX idx_notification_history_user ON notification_history(user_id, created_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history(status, created_at DESC);

-- =============================================================================
-- SUBSCRIPTIONS & PAYMENTS (Phase 2)
-- =============================================================================

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription details
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('basic', 'premium', 'elite')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    
    -- Stripe integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_billing_date DATE,
    cancelled_at TIMESTAMP,
    
    -- Settings
    auto_renew BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for subscriptions table
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date) WHERE status = 'active';

-- Billing history table
CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Stripe integration
    stripe_payment_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    
    -- Payment method
    payment_method VARCHAR(50),
    
    -- Dates
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for billing_history table
CREATE INDEX idx_billing_history_subscription ON billing_history(subscription_id, transaction_date DESC);
CREATE INDEX idx_billing_history_user ON billing_history(user_id, transaction_date DESC);
CREATE INDEX idx_billing_history_stripe ON billing_history(stripe_payment_id);

-- =============================================================================
-- ANALYTICS & TRACKING
-- =============================================================================

-- User activity log table
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for user_activity_log table
CREATE INDEX idx_user_activity_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_user_activity_type ON user_activity_log(activity_type, created_at DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_numerology_profiles_updated_at BEFORE UPDATE ON numerology_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment message count in conversation
CREATE OR REPLACE FUNCTION increment_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversations
    SET message_count = message_count + 1,
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment message count
CREATE TRIGGER increment_message_count AFTER INSERT ON ai_messages
    FOR EACH ROW EXECUTE FUNCTION increment_conversation_message_count();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Active users view
CREATE VIEW active_users AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_premium,
    u.last_login,
    COUNT(DISTINCT dr.id) as total_readings,
    COUNT(DISTINCT ac.id) as total_conversations
FROM users u
LEFT JOIN daily_readings dr ON u.id = dr.user_id
LEFT JOIN ai_conversations ac ON u.id = ac.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;

-- User engagement metrics view
CREATE VIEW user_engagement_metrics AS
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as registration_date,
    u.last_login,
    COUNT(DISTINCT dr.reading_date) as days_with_readings,
    COUNT(DISTINCT ac.id) as total_conversations,
    SUM(ac.message_count) as total_messages,
    CASE 
        WHEN u.last_login > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 'active'
        WHEN u.last_login > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN 'inactive'
        ELSE 'churned'
    END as user_status
FROM users u
LEFT JOIN daily_readings dr ON u.id = dr.user_id
LEFT JOIN ai_conversations ac ON u.id = ac.user_id
GROUP BY u.id;

-- =============================================================================
-- SAMPLE DATA (Development Only)
-- =============================================================================

-- Insert sample user (password: TestPass123)
INSERT INTO users (email, password_hash, full_name, date_of_birth, is_verified)
VALUES (
    'demo@numerai.app',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxF6O4TPa',
    'Demo User',
    '1990-05-15',
    TRUE
);

-- =============================================================================
-- GRANTS & PERMISSIONS
-- =============================================================================

-- Create application user
CREATE USER numerai_app WITH PASSWORD 'your-secure-password-here';

-- Grant permissions
GRANT CONNECT ON DATABASE numerai TO numerai_app;
GRANT USAGE ON SCHEMA public TO numerai_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO numerai_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO numerai_app;

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO numerai_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO numerai_app;

-- =============================================================================
-- MAINTENANCE
-- =============================================================================

-- Vacuum and analyze
VACUUM ANALYZE;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE users IS 'Core user accounts and authentication';
COMMENT ON TABLE numerology_profiles IS 'Calculated numerology data for each user';
COMMENT ON TABLE daily_readings IS 'Daily numerology readings (partitioned by month)';
COMMENT ON TABLE ai_conversations IS 'AI chatbot conversation sessions';
COMMENT ON TABLE ai_messages IS 'Individual messages in AI conversations (partitioned by hash)';
COMMENT ON TABLE device_tokens IS 'FCM device tokens for push notifications';
COMMENT ON TABLE notification_settings IS 'User notification preferences';

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================