import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionTitle } from "./SectionTitle";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Globe, Smartphone, Palette, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const ORDER_TYPES = [
  { id: "Veb-sayt yaratish", icon: Globe, desc: "Landing, biznes, e-commerce sayt" },
  { id: "Mobil ilova", icon: Smartphone, desc: "iOS / Android ilovasi" },
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

export const OrderForm = () => {
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
      const { error } = await supabase.from("orders").insert({
        ...parsed.data,
        user_id: userData.user?.id ?? null,
      });
      if (error) throw error;

      fetch("https://hook.eu1.make.com/fo8n7s4g33vakd3z27ldkgvrmoa6sztt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "order",
          ...parsed.data,
          submittedAt: new Date().toISOString(),
        }),
      }).catch(() => {});

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
    <section id="order" className="relative py-24 md:py-32">
      <div className="container">
        <SectionTitle eyebrow="Zakaz berish" title="Loyihangizni boshlang" subtitle="Xizmat turini tanlang va batafsil yozing." />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {ORDER_TYPES.map((o) => {
            const Icon = o.icon;
            const active = type === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setType(o.id)}
                className={cn(
                  "glass rounded-2xl p-5 text-left transition-all hover:scale-[1.02]",
                  active && "ring-2 ring-primary shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
                )}
              >
                <Icon className={cn("h-6 w-6 mb-2", active ? "text-primary" : "text-muted-foreground")} />
                <div className="font-semibold text-sm">{o.id}</div>
                <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>
              </button>
            );
          })}
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 max-w-2xl mx-auto glass rounded-3xl p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="o_name">Ismingiz</Label>
              <Input id="o_name" value={data.customer_name} onChange={(e) => setData({ ...data, customer_name: e.target.value })} className="mt-2 bg-muted/40" />
            </div>
            <div>
              <Label htmlFor="o_email">Email</Label>
              <Input id="o_email" type="email" value={data.customer_email} onChange={(e) => setData({ ...data, customer_email: e.target.value })} className="mt-2 bg-muted/40" />
            </div>
          </div>
          <div>
            <Label htmlFor="o_budget">Byudjet (ixtiyoriy)</Label>
            <Input id="o_budget" placeholder="$500 - $2000" value={data.budget} onChange={(e) => setData({ ...data, budget: e.target.value })} className="mt-2 bg-muted/40" />
          </div>
          <div>
            <Label htmlFor="o_desc">Loyiha tafsiloti</Label>
            <Textarea id="o_desc" rows={5} value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} className="mt-2 bg-muted/40" />
          </div>
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading || done}>
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Yuborilmoqda…</>)
              : done ? (<><CheckCircle2 className="h-4 w-4" /> Yuborildi</>)
              : "Zakazni yuborish"}
          </Button>
        </motion.form>
      </div>
    </section>
  );
};