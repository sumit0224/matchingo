-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    bio TEXT,
    relationship_goals VARCHAR(50),
    lifestyle JSONB,
    job_title VARCHAR(100),
    company VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL,
    longitude DECIMAL,
    is_profile_completed BOOLEAN DEFAULT FALSE,
    gender_preference VARCHAR(20) DEFAULT 'Everyone',
    min_age_preference INT DEFAULT 18,
    max_age_preference INT DEFAULT 50,
    max_distance_preference INT DEFAULT 50, -- in KM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTPs Table
CREATE TABLE IF NOT EXISTS otps (
    mobile_number VARCHAR(20) PRIMARY KEY,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos Table
CREATE TABLE IF NOT EXISTS user_photos (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swipes Table
-- Action: 'like', 'dislike', 'superlike'
CREATE TABLE IF NOT EXISTS swipes (
    id SERIAL PRIMARY KEY,
    swiper_id INT REFERENCES users(id) ON DELETE CASCADE,
    swiped_id INT REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_id) -- Prevent duplicate swipes
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(id) ON DELETE CASCADE,
    user2_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_match CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_swipes_participants ON swipes(swiper_id, swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_participants ON matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
