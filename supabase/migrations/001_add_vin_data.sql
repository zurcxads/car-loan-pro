-- Add VIN decoded data to deals table
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS vin_decoded JSONB DEFAULT '{}';

COMMENT ON COLUMN deals.vin_decoded IS 'Decoded VIN information from NHTSA API';
