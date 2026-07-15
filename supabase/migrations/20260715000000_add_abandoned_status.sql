-- Add ABANDONED to orders status check constraint
-- Run this via Supabase Dashboard SQL Editor

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('CREATED', 'READY', 'DELIVERED', 'CANCELLED', 'ABANDONED'));

-- Add comment for documentation
COMMENT ON COLUMN orders.status IS 'Order status: CREATED (pending), READY (ready for pickup), DELIVERED (completed), ABANDONED (not picked up after extended period), CANCELLED (cancelled)';
