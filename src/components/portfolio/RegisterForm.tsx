import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionTitle } from "./SectionTitle";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Globe, Smartphone, Palette, Sparkles, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ORDER_TYPES = [
  { id: "Veb-sayt yaratish", icon: Globe, desc: "Landing, biznes, e-commerce" },
  { id: "Mobil ilova", icon: Smartphone, desc: "iOS / Android" },
  { id: "Dizayn", icon: Palette, desc: "UI/UX, logo, brending" },
  { id: "Boshqa", icon: Sparkles, desc: "Boshqa raqamli xizmat" },
];

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  customer_email: z.string().trim().email().max(255),
  order_type: z.string().min(1),
  budget: z.string().max(80).optional(),
  description: z.string().trim().min(5).max(2000),
});

// Yuqoridagi (#register) zakaz formasi — chiroyli animatsiyali variant.
// Pastda esa to'liq OrderForm (#order) ham ishlashda davom etadi.
export const RegisterForm = () => {
  const [type, setType] = useState<string | null>(null);
  const [data, setData] = useState({ customer_name: "", customer_email: "", budget: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast.error("Zakaz turini tanlang");
      return;
    }
    const parsed = schema.safeParse({ ...data, order_type: type });
    if (!parsed.success) {
      toast.error("Maydonlarni to'g'ri to'ldiring");
      return;
    }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: inserted, error } = await supabase.from("orders").insert([{
        customer_name: parsed.data.customer_name,
        customer_email: parsed.data.customer_email,
        order_type: parsed.data.order_type,
        budget: parsed.data.budget,
        description: parsed.data.description,
        user_id: userData.user?.id ?? undefined,
      }]).select("id").single();
      if (error) throw error;

      if (inserted) {
        supabase.functions.invoke("forward-webhook", {
          body: {
            table: "orders",
            row_id: inserted.id,
            payload: {
              form: "order_quick",
              ...parsed.data,
              submittedAt: new Date().toISOString(),
            },
          },
        }).catch(() => {});
      }

      setDone(true);
      toast.success("Zakaz yuborildi!", { description: "Tez orada bog'lanaman." });
      setData({ customer_name: "", customer_email: "", budget: "", description: "" });
      setType(null);
      setTimeout(() => setDone(false), 2500);
    } catch (err: any) {
      toast.error("Yuborib bo'lmadi", { description: err?.message ?? "Qayta urinib ko'ring." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="register" className="relative py-24 md:py-32 overflow-hidden">
      {/* Animatsiyali fon */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          aria-hidden
          className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-32 -right-32 h-[26rem] w-[26rem] rounded-full bg-accent/20 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container">
        <SectionTitle
          title="Loyihangizni hoziroq boshlang"
          subtitle="Bir necha soniyada zakaz yuboring — tez orada bog'lanaman."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden">
            <motion.div
              aria-hidden
              className="absolute -inset-px rounded-3xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, hsl(var(--primary)/0.4), transparent 40%, hsl(var(--accent)/0.4) 80%)",
                opacity: 0.3,
              }}
              animate={{ opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {ORDER_TYPES.map((o, i) => {
                  const Icon = o.icon;
                  const active = type === o.id;
                  return (
                    <motion.button
                      key={o.id}
                      type="button"
                      onClick={() => setType(o.id)}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i, duration: 0.4 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "rounded-2xl p-4 text-left border border-border bg-muted/30 transition-all",
                        active &&
                          "ring-2 ring-primary border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.45)] bg-primary/10"
                      )}
                    >
                      <Icon className={cn("h-6 w-6 mb-2", active ? "text-primary" : "text-muted-foreground")} />
                      <div className="font-semibold text-sm">{o.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>
                    </motion.button>
                  );
                })}
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                    <Label htmlFor="r_name">Ismingiz</Label>
                    <Input id="r_name" value={data.customer_name} onChange={(e) => setData({ ...data, customer_name: e.target.value })} className="mt-2 bg-muted/40" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
                    <Label htmlFor="r_email">Email</Label>
                    <Input id="r_email" type="email" value={data.customer_email} onChange={(e) => setData({ ...data, customer_email: e.target.value })} className="mt-2 bg-muted/40" />
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                  <Label htmlFor="r_budget">Byudjet (ixtiyoriy)</Label>
                  <Input id="r_budget" placeholder="$500 - $2000" value={data.budget} onChange={(e) => setData({ ...data, budget: e.target.value })} className="mt-2 bg-muted/40" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
                  <Label htmlFor="r_desc">Loyiha tafsiloti</Label>
                  <Textarea id="r_desc" rows={4} value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} className="mt-2 bg-muted/40" />
                </motion.div>
                <Button type="submit" variant="hero" size="xl" className="w-full group" disabled={loading || done}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Yuborilmoqda…</>
                  ) : done ? (
                    <><CheckCircle2 className="h-4 w-4" /> Yuborildi</>
                  ) : (
                    <><Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> Zakazni yuborish</>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};