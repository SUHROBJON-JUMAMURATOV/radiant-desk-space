
-- Restrict has_role execution - only allow internal use via RLS
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- Replace permissive order insert with validated one
DROP POLICY "Anyone can create order" ON public.orders;
CREATE POLICY "Anyone can submit order with valid data" ON public.orders FOR INSERT TO anon, authenticated
WITH CHECK (
  length(customer_email) > 3
  AND length(customer_email) <= 255
  AND customer_email LIKE '%@%'
  AND length(order_type) > 0
  AND length(order_type) <= 100
  AND (description IS NULL OR length(description) <= 5000)
);
