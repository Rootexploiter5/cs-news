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
    threat_actor TEXT DEFAULT 'Unknown',
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    cve_list JSONB DEFAULT '[]'::jsonb,
    embedding VECTOR(768),
    source TEXT DEFAULT 'Unknown',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_threat_articles_source_url ON threat_articles (source_url);
CREATE INDEX IF NOT EXISTS idx_threat_articles_published ON threat_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_articles_severity ON threat_articles (severity DESC);

-- HNSW Vector index for fast, high-recall cosine similarity queries
CREATE INDEX IF NOT EXISTS idx_threat_articles_embedding ON threat_articles 
USING hnsw (embedding vector_cosine_ops);

-- ==============================================================================
-- Seed Baseline Threat Intelligence Data
-- ==============================================================================
INSERT INTO threat_articles (source_url, title, summary, threat_actor, severity, cve_list, source, published_at)
VALUES 
(
    'https://www.bleepingcomputer.com/news/security/lockbit-ransomware-surge-hits-critical-infrastructure/',
    'LockBit Ransomware Surge Targets Critical Infrastructure Globally',
    'A surge in LockBit ransomware intrusions has impacted manufacturing and healthcare sectors. The group exploits exposed VPN gateways and unpatched remote management endpoints to gain initial access before exfiltrating corporate data.',
    'LockBit 3.0',
    9,
    '["CVE-2024-21887", "CVE-2024-3400"]'::jsonb,
    'BleepingComputer',
    NOW() - INTERVAL '2 hours'
),
(
    'https://thehackernews.com/2026/04/cisco-patches-critical-vpn-zero-day.html',
    'Critical Zero-Day in Cisco ASA and FTD Firewalls Actively Exploited in the Wild',
    'Cisco released emergency patches addressing a remote code execution zero-day flaw in ASA and FTD software. Threat actors are using crafted HTTP requests to bypass authentication and execute arbitrary commands with administrative privileges.',
    'Volt Typhoon',
    10,
    '["CVE-2026-1029", "CVE-2026-1030"]'::jsonb,
    'The Hacker News',
    NOW() - INTERVAL '5 hours'
),
(
    'https://www.bleepingcomputer.com/news/security/phishing-campaign-delivers-darkgate-loader-via-malicious-pdfs/',
    'Massive Phishing Wave Deploys DarkGate Malware Through PDF Attachments',
    'Security researchers observed a high-volume phishing campaign distributing DarkGate loader disguised as financial invoices. The payload establishes persistence, steals browser credentials, and enables remote desktop control.',
    'DarkGate Operator',
    7,
    '[]'::jsonb,
    'BleepingComputer',
    NOW() - INTERVAL '1 day'
),
(
    'https://thehackernews.com/2026/04/ivanti-vpn-authentication-bypass-alert.html',
    'Ivanti Connect Secure Zero-Day Flaws Linked to Widespread Espionage Attacks',
    'State-sponsored threat actors are exploiting multiple zero-day vulnerabilities in Ivanti Connect Secure VPN appliances to execute arbitrary code and harvest domain credentials across defense and telecommunications networks.',
    'UNC5221',
    9,
    '["CVE-2024-21887", "CVE-2023-46805"]'::jsonb,
    'The Hacker News',
    NOW() - INTERVAL '2 days'
),
(
    'https://www.bleepingcomputer.com/news/security/open-source-supply-chain-attack-targets-npm-cryptocurrency-wallets/',
    'Malicious NPM Packages Target Crypto Wallets via Supply Chain Hijacking',
    'Multiple malicious packages published to the npm registry were found harvesting private keys and clipboard contents from Web3 and crypto trading applications. Over 50,000 downloads occurred before detection.',
    'Unknown / Financially Motivated',
    6,
    '[]'::jsonb,
    'BleepingComputer',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (source_url) DO NOTHING;

