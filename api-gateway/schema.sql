-- NFT Metadata Table
CREATE TABLE IF NOT EXISTS nft_metadata (
    token_id BIGINT PRIMARY KEY,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    address VARCHAR(42) PRIMARY KEY,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction History Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    token_id BIGINT NOT NULL,
    price NUMERIC(78, 0) NOT NULL, -- To handle wei values
    seller_address VARCHAR(42) NOT NULL,
    buyer_address VARCHAR(42) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fraud_score FLOAT,
    FOREIGN KEY (token_id) REFERENCES nft_metadata(token_id)
);

-- User Activity Table (for ML features)
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'bid', 'purchase'
    token_id BIGINT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    FOREIGN KEY (token_id) REFERENCES nft_metadata(token_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_token_id ON transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_address);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_address);
CREATE INDEX IF NOT EXISTS idx_user_activity_address ON user_activity(address);
CREATE INDEX IF NOT EXISTS idx_user_activity_token ON user_activity(token_id);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nft_metadata_timestamp
    BEFORE UPDATE ON nft_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_preferences_timestamp
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();