import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Emblem } from "@/components/layout/Emblem";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import heroImg from "@/assets/btp-hero.jpg";
import rulesImg from "@/assets/btp-rules.jpg";
import { useI18n } from "@/lib/i18n";

const ADMIN_EMAIL = "admin@test.btp.in";

export default function AuthPage() {
  const { login, register } = useAuth();
  const { lang, tx } = useI18n();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTab = (v: string) => {
    const t = v as "user" | "admin";
    setTab(t);
    setEmail(t === "admin" ? ADMIN_EMAIL : "");
    setPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { toast.error(tx("Enter a valid email address")); return; }
    if (!password) { toast.error(tx("Enter your password")); return; }
    if (tab === "admin" && trimmed !== ADMIN_EMAIL) { toast.error(`Admin email must be ${ADMIN_EMAIL}`); return; }

    setLoading(true);
    try {
      const u = mode === "login"
        ? await login(trimmed, password)
        : await register(trimmed, password);
      toast.success(`${tx("Signed in as")} ${tx(u.role)}`);
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tx("Sign in failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className={"grid min-h-screen w-full grid-cols-1 bg-background lg:grid-cols-2" + (lang === "kn" ? " font-kn" : "")}>
        {/* LEFT: form */}
        <div className="relative flex items-center justify-center px-6 py-10 md:px-12 lg:col-start-1">
          <Link to="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> {tx("Back to dashboard")}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 flex items-center gap-3">
              <span className="rounded-lg bg-[var(--navy)] p-2 text-[var(--saffron)] ring-1 ring-[var(--saffron)]/30">
                <Emblem className="h-8 w-8" />
              </span>
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{tx("Bangalore Traffic Police")}</div>
                <div className="text-base font-semibold">{tx("Parking Intelligence")}</div>
              </div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{tx("Welcome back")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{tx("Sign in to access citizen tools or the officer console.")}</p>

            <Tabs value={tab} onValueChange={handleTab} className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">{tx("Citizen")}</TabsTrigger>
                <TabsTrigger value="admin">{tx("Officer")}</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4 flex gap-2 text-sm">
              <button onClick={() => setMode("login")} className={"pb-0.5 " + (mode === "login" ? "border-b-2 border-[var(--saffron)] font-medium" : "text-muted-foreground")}>{tx("Sign in")}</button>
              <span className="text-muted-foreground">/</span>
              <button onClick={() => setMode("register")} className={"pb-0.5 " + (mode === "register" ? "border-b-2 border-[var(--saffron)] font-medium" : "text-muted-foreground")}>{tx("Register")}</button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{tx("Email")}</Label>
                <Input id="email" type="email" placeholder={tab === "admin" ? ADMIN_EMAIL : "you@example.com"} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{tx("Password")}</Label>
                <Input id="password" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="h-11" />
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-[var(--saffron)] text-[var(--saffron-foreground)] hover:bg-[var(--saffron)]/90">
                {loading ? tx("Please wait…") : mode === "register" ? tx("Create account") : (tab === "admin" ? tx("Sign in as Officer") : tx("Sign in as Citizen"))}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Demo seed: admin@test.btp.in / admin123 &nbsp;·&nbsp; rahul@example.com / user123
              </p>
            </form>

            <p className="mt-10 text-center text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} Bangalore Traffic Police. All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* RIGHT: image */}
        <div className="relative hidden lg:col-start-2 lg:block">
          <img src={heroImg} alt="BTP" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/80 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-8 text-white">
            <div className="font-kn text-sm text-white/80">ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್</div>
            <div className="mt-1 text-2xl font-semibold">{tx("Parking Intelligence")}</div>
            <div className="mt-2 max-w-sm text-sm text-white/80">{tx("Live enforcement analytics, challan management, and citizen services for Bengaluru.")}</div>
          </div>
        </div>
      </div>
    </>
  );
}
