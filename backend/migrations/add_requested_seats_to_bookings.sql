-- Add requested_seats column to bookings table for public reservations
-- This column stores seat details as JSON for admin reference without blocking seats

ALTER TABLE bookings 
ADD COLUMN requested_seats JSON COMMENT 'Requested seat details for public reservations (JSON array)';

-- Add index for better query performance on JSON column
CREATE INDEX idx_bookings_requested_seats ON bookings ((requested_seats IS NOT NULL));

-- Update existing pending bookings to have empty requested_seats if they don't have BookedSeat records
-- This ensures consistency for existing data
UPDATE bookings 
SET requested_seats = JSON_ARRAY() 
WHERE status = 'pending' 
AND requested_seats IS NULL;
