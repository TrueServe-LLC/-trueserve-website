
-- Function to safely increment driver balance
CREATE OR REPLACE FUNCTION increment_driver_balance(driver_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE "Driver"
  SET 
    balance = balance + amount,
    "totalEarnings" = "totalEarnings" + amount,
    "updatedAt" = NOW()
  WHERE id = driver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
