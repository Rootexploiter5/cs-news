-- ==============================================================================
-- Sentinel AI: Database Initialization & Vector Extension Setup
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Table: Threat Intelligence Articles
CREATE TABLE IF NOT EXISTS threat_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    threat_actor TEXT DEFAULT 'Unknown',
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    cve_list JSONB DEFAULT '[]'::jsonb,
    embedding VECTOR(768),
    source TEXT DEFAULT 'Unknown',
    alert_sent BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_threat_articles_source_url ON threat_articles (source_url);
CREATE INDEX IF NOT EXISTS idx_threat_articles_published ON threat_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_articles_severity ON threat_articles (severity DESC);
CREATE INDEX IF NOT EXISTS idx_threat_articles_alert_sent ON threat_articles (alert_sent, severity);

-- HNSW Vector index for fast, high-recall cosine similarity queries
CREATE INDEX IF NOT EXISTS idx_threat_articles_embedding ON threat_articles 
USING hnsw (embedding vector_cosine_ops);



