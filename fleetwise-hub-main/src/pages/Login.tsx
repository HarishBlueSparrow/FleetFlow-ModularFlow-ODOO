import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Mail, Lock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFleetStore, UserRole } from '@/store/fleetStore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@fleetops.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('manager');
  const login = useFleetStore((s) => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    login(email, password, role);
    toast({ title: 'Welcome back!', description: `Logged in as ${role}` });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--accent)/0.15),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 px-12 text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-xl bg-accent p-3">
              <Truck className="h-8 w-8 text-accent-foreground" />
            </div>
            <span className="text-3xl font-bold tracking-tight">FleetOps</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Command Your Fleet.<br />
            <span className="text-accent">Optimize Every Mile.</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Centralized fleet management with real-time tracking, smart dispatching, and financial insights.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Vehicles Managed', value: '2,400+' },
              { label: 'Trips Completed', value: '18K' },
              { label: 'Cost Saved', value: '32%' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-accent">{stat.value}</p>
                <p className="text-xs text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="rounded-lg bg-primary p-2">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FleetOps</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access the command center</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Fleet Manager</SelectItem>
                  <SelectItem value="dispatcher">Dispatcher</SelectItem>
                  <SelectItem value="safety_officer">Safety Officer</SelectItem>
                  <SelectItem value="analyst">Financial Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>

            <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Forgot Password?
            </button>
          </form>

          <p className="mt-8 text-xs text-center text-muted-foreground">
            Demo: Use any email/password to sign in
          </p>
        </motion.div>
      </div>
    </div>
  );
}
