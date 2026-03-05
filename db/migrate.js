const pool = require('./pool');

const schema = `
-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  org_name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (for connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

-- Reference: Capabilities
CREATE TABLE IF NOT EXISTS capabilities (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(20) NOT NULL,
  sort_order INTEGER NOT NULL
);

-- Reference: Sub-capabilities
CREATE TABLE IF NOT EXISTS sub_capabilities (
  id VARCHAR(10) PRIMARY KEY,
  capability_id INTEGER NOT NULL REFERENCES capabilities(id),
  name VARCHAR(255) NOT NULL,
  is_dei BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL
);

-- Reference: Level descriptions
CREATE TABLE IF NOT EXISTS level_descriptions (
  id SERIAL PRIMARY KEY,
  sub_capability_id VARCHAR(10) NOT NULL REFERENCES sub_capabilities(id),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  description TEXT NOT NULL,
  UNIQUE(sub_capability_id, level)
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_name VARCHAR(255),
  assessor VARCHAR(255),
  assessment_date DATE,
  context_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores (per sub-capability per assessment)
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  sub_capability_id VARCHAR(10) NOT NULL REFERENCES sub_capabilities(id),
  current_level INTEGER CHECK (current_level BETWEEN 1 AND 4),
  target_level INTEGER CHECK (target_level BETWEEN 1 AND 4),
  priority VARCHAR(20) CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  field_notes TEXT,
  resources TEXT,
  timeline_start DATE,
  timeline_end DATE,
  timeline_owner VARCHAR(255),
  UNIQUE(assessment_id, sub_capability_id)
);

-- Milestones (per score)
CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  score_id INTEGER NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  activity TEXT,
  owner VARCHAR(255),
  target_date DATE,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Done', 'Blocked')),
  sort_order INTEGER DEFAULT 0
);
`;

async function migrate() {
  try {
    await pool.query(schema);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
