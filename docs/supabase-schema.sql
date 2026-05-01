-- Run this in the Supabase dashboard SQL editor (Database > SQL Editor > New query)

-- Table: saved_locations
CREATE TABLE saved_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  lat DECIMAL(9,6),
  lon DECIMAL(9,6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_session TEXT  -- anonymous session ID for demo purposes
);

-- Enable Row Level Security
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for now (coursework scope)
CREATE POLICY "Allow all" ON saved_locations FOR ALL USING (true);

-- Table: weather_cache
CREATE TABLE weather_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL UNIQUE,
  weather_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON weather_cache FOR ALL USING (true);
