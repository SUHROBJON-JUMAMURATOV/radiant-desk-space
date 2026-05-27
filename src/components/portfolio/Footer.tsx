import { Github, Instagram, Linkedin, Send, Code2 } from "lucide-react";
import { useLang } from "@/hooks/useLang";

const socials = [
  { Icon: Send, href: "https://t.me/suhrob_O775", label: "Telegram" },
  { Icon: Instagram, href: "https://www.instagram.com/xamzayevich.o7?utm_source=qr", label: "Instagram" },
  { Icon: Github, href: "https://github.com/", label: "GitHub" },
  { Icon: Linkedin, href: "https://linkedin.com/", label: "LinkedIn" },
];

export const Footer = () => {
  const { t } = useLang();
  const sections = [
    {
      title: t.footer.nav,
      links: [
        { href: "#home", label: t.nav.home },
        { href: "#about", label: t.nav.about },
        { href: "#projects", label: t.nav.projects },
        { href: "#contact", label: t.nav.contact },
      ],
    },
    {
      title: t.footer.services,
      links: [
        { href: "#hire", label: "Web Development" },
        { href: "#hire", label: "UI/UX Design" },
        { href: "#hire", label: "Consulting" },
        { href: "#hire", label: "AI Integration" },
      ],
    },
  ];
  return (
    <footer className="relative border-t border-border mt-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <a href="#home" className="flex items-center gap-2">
              <Code2 className="h-7 w-7 text-primary" />
              <span className="font-display font-bold text-xl">
                Jumamuratov<span className="text-gradient">.Suhrobjon</span>
              </span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="h-10 w-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all hover:shadow-[0_0_20px_hsl(180_100%_50%/0.5)]"
                >
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="font-display font-semibold mb-4">{s.title}</h4>
              <ul className="space-y-2">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Jumamuratov Suhrobjon. {t.footer.rights}</p>
          <p className="font-mono">Built with React + Tailwind + Framer Motion</p>
        </div>
      </div>
    </footer>
  );
};
