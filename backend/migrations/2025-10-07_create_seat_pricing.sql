-- Create seat_pricing table
CREATE TABLE IF NOT EXISTS seat_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  auditorium_id UUID NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
  show_id UUID NULL REFERENCES shows(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  pricing_type VARCHAR(20) NOT NULL DEFAULT 'base',
  is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
  effective_from TIMESTAMP NULL,
  effective_to TIMESTAMP NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_seat_show UNIQUE (seat_id, show_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seat_pricing_auditorium ON seat_pricing(auditorium_id);
CREATE INDEX IF NOT EXISTS idx_seat_pricing_show ON seat_pricing(show_id);
CREATE INDEX IF NOT EXISTS idx_seat_pricing_time_from ON seat_pricing(effective_from);
CREATE INDEX IF NOT EXISTS idx_seat_pricing_time_to ON seat_pricing(effective_to);
CREATE INDEX IF NOT EXISTS idx_seat_pricing_seat ON seat_pricing(seat_id);

-- Comments
COMMENT ON COLUMN seat_pricing.show_id IS 'Null means base price for seat across shows; value means show-specific override';
COMMENT ON COLUMN seat_pricing.pricing_type IS 'base or show_specific';

