import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, LogOut, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { lovable } from "@/integrations/lovable";

const WebhookBadge = ({ status, error }: { status: string | null; error: string | null }) => {
  if (status === "sent") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Webhook ✓</Badge>;
  if (status === "failed") return <Badge variant="destructive" title={error ?? ""}>Webhook ✗</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Webhook …</Badge>;
};

type Profile = { id: string; email: string; full_name: string | null; visible_password: string | null; provider: string; created_at: string; webhook_status: string | null; webhook_error: string | null };
type Order = { id: string; customer_email: string; customer_name: string | null; order_type: string; budget: string | null; description: string | null; status: string; created_at: string; webhook_status: string | null; webhook_error: string | null };

const Admin = () => {
  const [session, setSession] = useState<any>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});

  // login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles((p ?? []) as Profile[]);
    setOrders((o ?? []) as Order[]);
    setLoading(false);
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error("Kira olmadingiz", { description: error.message });
    setLoading(false);
  };

  const onGoogle = async () => {
    await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
  };

  const onLogout = async () => {
    await supabase.auth.signOut();
  };

  if (session === undefined) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <form onSubmit={onLogin} className="glass rounded-3xl p-8 w-full max-w-md space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin paneli</h1>
          </div>
          <div>
            <Label htmlFor="a_email">Email</Label>
            <Input id="a_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 bg-muted/40" required />
          </div>
          <div>
            <Label htmlFor="a_pw">Parol</Label>
            <Input id="a_pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 bg-muted/40" required />
          </div>
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirish"}
          </Button>
          <Button type="button" onClick={onGoogle} variant="ghostGlass" size="xl" className="w-full">
            Google bilan kirish
          </Button>
        </form>
      </div>
    );
  }

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="glass rounded-3xl p-8 max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold">Sizda ruxsat yo'q</h1>
          <p className="text-sm text-muted-foreground">Bu sahifa faqat adminlar uchun.</p>
          <p className="text-xs font-mono text-muted-foreground break-all">{session.user.email}</p>
          <p className="text-xs text-muted-foreground">User ID: <span className="font-mono">{session.user.id}</span></p>
          <Button variant="ghostGlass" onClick={onLogout}><LogOut className="h-4 w-4" /> Chiqish</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Admin paneli</h1>
          </div>
          <Button variant="ghostGlass" onClick={onLogout}><LogOut className="h-4 w-4" /> Chiqish</Button>
        </div>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Zakazlar ({orders.length})</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar ({profiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6 space-y-3">
            {loading && <Loader2 className="h-6 w-6 animate-spin" />}
            {orders.length === 0 && !loading && <p className="text-muted-foreground text-sm">Hali zakaz yo'q.</p>}
            {orders.map((o) => (
              <div key={o.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge>{o.order_type}</Badge>
                  <Badge variant="outline">{o.status}</Badge>
                  <WebhookBadge status={o.webhook_status} error={o.webhook_error} />
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(o.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm"><b>{o.customer_name ?? "—"}</b> · <span className="text-muted-foreground">{o.customer_email}</span></div>
                {o.budget && <div className="text-sm mt-1">Byudjet: <span className="font-mono">{o.budget}</span></div>}
                {o.description && <p className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground">{o.description}</p>}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-6 space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{p.full_name || "—"}</div>
                  <Badge variant="outline">{p.provider}</Badge>
                  <WebhookBadge status={p.webhook_status} error={p.webhook_error} />
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(p.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{p.email}</div>
                {p.visible_password && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Parol:</span>
                    <span className="font-mono">{showPw[p.id] ? p.visible_password : "••••••••"}</span>
                    <button type="button" onClick={() => setShowPw((s) => ({ ...s, [p.id]: !s[p.id] }))} className="text-muted-foreground hover:text-foreground">
                      {showPw[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;