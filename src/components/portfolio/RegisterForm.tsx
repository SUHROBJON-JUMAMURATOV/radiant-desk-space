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
      await fetch("https://hook.eu1.make.com/fo8n7s4g33vakd3z27ldkgvrmoa6sztt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: "register",
          name: data.name,
          email: data.email,
          password: data.password,
          submittedAt: new Date().toISOString(),
        }),
      });
      setDone(true);
      toast.success("Welcome aboard!", { description: "Your account has been created." });
      setData({ name: "", email: "", password: "" });
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      toast.error("Failed to register", { description: "Please try again later." });
    } finally {
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
        </motion.form>
      </div>
    </section>
  );
};
