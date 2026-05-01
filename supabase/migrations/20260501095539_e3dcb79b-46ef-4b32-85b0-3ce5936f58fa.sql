
ALTER TABLE public.orders ADD COLUMN webhook_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN webhook_error TEXT;
ALTER TABLE public.profiles ADD COLUMN webhook_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN webhook_error TEXT;

-- Allow updating webhook status from anyone who created the row (or anon for orders)
CREATE POLICY "Anyone can update webhook status on orders" ON public.orders
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);
