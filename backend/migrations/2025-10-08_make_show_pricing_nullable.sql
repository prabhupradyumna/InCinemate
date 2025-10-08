-- Migration: Make Show.pricing field nullable
-- Date: 2025-10-08
-- Description: Allow null values for pricing field as we transition to SeatPricing model

-- Make the pricing column nullable
ALTER TABLE shows 
ALTER COLUMN pricing DROP NOT NULL;

-- Add a comment to indicate this field is deprecated
COMMENT ON COLUMN shows.pricing IS 'DEPRECATED: Dynamic pricing structure - Use SeatPricing model instead. This field is kept for backward compatibility.';
