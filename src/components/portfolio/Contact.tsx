import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionTitle } from "./SectionTitle";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Loader2, CheckCircle2, Send } from "lucide-react";
import { useLang } from "@/hooks/useLang";

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(2, "Subject required").max(120),
  message: z.string().trim().min(10, "Message too short").max(2000),
});

export const Contact = () => {
  const { t } = useLang();
  const [data, setData] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await fetch("https://hook.eu1.make.com/fo8n7s4g33vakd3z27ldkgvrmoa6sztt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: "contact", ...data, submittedAt: new Date().toISOString() }),
      });
      setDone(true);
      toast.success("Message sent!", { description: "Thanks — I'll reply soon." });
      setData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      toast.error("Failed to send", { description: "Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="container">
        <SectionTitle eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} />

        <div className="mt-12 grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              { Icon: Mail, label: t.contact.emailLabel, value: "Suhrobjon1606@gmail.com" },
              { Icon: Phone, label: t.contact.phoneLabel, value: "+998-20-000-3916" },
              { Icon: MapPin, label: t.contact.locationLabel, value: t.contact.location },
            ].map((c) => (
              <div key={c.label} className="glass rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center neon-glow-cyan shrink-0">
                  <c.Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="font-medium truncate">{c.value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 glass rounded-3xl p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="cname">{t.contact.name}</Label>
                <Input id="cname" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="mt-2 bg-muted/40" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="cemail">{t.contact.email}</Label>
                <Input id="cemail" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="mt-2 bg-muted/40" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="csub">{t.contact.subject}</Label>
              <Input id="csub" value={data.subject} onChange={(e) => setData({ ...data, subject: e.target.value })} className="mt-2 bg-muted/40" />
              {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
            </div>
            <div>
              <Label htmlFor="cmsg">{t.contact.message}</Label>
              <Textarea id="cmsg" rows={5} value={data.message} onChange={(e) => setData({ ...data, message: e.target.value })} className="mt-2 bg-muted/40 resize-none" />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading || done}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t.contact.loading}</>
              ) : done ? (
                <><CheckCircle2 className="h-4 w-4" /> {t.contact.done}</>
              ) : (
                <><Send className="h-4 w-4" /> {t.contact.submit}</>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
