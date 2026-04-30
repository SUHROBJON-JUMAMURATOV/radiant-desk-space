import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/i18n/translations";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  const links = [
    { href: "#home", label: t.nav.home },
    { href: "#about", label: t.nav.about },
    { href: "#skills", label: t.nav.skills },
    { href: "#projects", label: t.nav.projects },
    { href: "#register", label: t.nav.register },
    { href: "#order", label: "Zakaz" },
    { href: "#hire", label: t.nav.hire },
    { href: "#contact", label: t.nav.contact },
  ];

  const langs: { code: Lang; label: string }[] = [
    { code: "uz", label: "UZ" },
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong py-3" : "bg-transparent py-5"
      )}
    >
      <nav className="container flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="relative">
            <Code2 className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
            <div className="absolute inset-0 blur-md bg-primary/40 -z-10" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Suhrob<span className="text-gradient">.Developer</span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {l.label}
                <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 glass rounded-full p-1">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn(
                  "px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all",
                  lang === l.code
                    ? "bg-gradient-primary text-primary-foreground shadow-[0_0_15px_hsl(180_100%_50%/0.5)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden glass-strong overflow-hidden"
          >
            <ul className="container py-4 flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-foreground hover:bg-muted/40 rounded-lg transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-1 glass rounded-full p-1 mt-2 self-start sm:hidden">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={cn(
                      "px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all",
                      lang === l.code
                        ? "bg-gradient-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
