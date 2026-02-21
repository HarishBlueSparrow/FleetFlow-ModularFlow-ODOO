import { useState } from 'react';
import { Plus, AlertTriangle, Shield, Search } from 'lucide-react';
import { PageHeader } from '@/components/fleet/PageHeader';
import { useFleetStore, Driver, DriverStatus } from '@/store/fleetStore';
import { getDriverStatusClass, isLicenseExpired, isLicenseExpiringSoon } from '@/lib/fleet-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function DriversPage() {
  const drivers = useFleetStore((s) => s.drivers);
  const addDriver = useFleetStore((s) => s.addDriver);
  const updateDriver = useFleetStore((s) => s.updateDriver);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '',
    licenseCategories: [] as string[],
  });

  const toggleCategory = (cat: string) => {
    setForm((f) => ({
      ...f,
      licenseCategories: f.licenseCategories.includes(cat)
        ? f.licenseCategories.filter((c) => c !== cat)
        : [...f.licenseCategories, cat],
    }));
  };

  const handleAdd = () => {
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) {
      toast({ title: 'Error', description: 'Name, license number and expiry required', variant: 'destructive' });
      return;
    }
    addDriver({
      ...form,
      licenseCategories: form.licenseCategories as any,
      status: 'On Duty',
      safetyScore: 100,
      tripsCompleted: 0,
      tripsTotal: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    });
    toast({ title: 'Driver added', description: form.name });
    setDialogOpen(false);
    setForm({ name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', licenseCategories: [] });
  };

  const toggleStatus = (d: Driver, newStatus: DriverStatus) => {
    updateDriver(d.id, { status: newStatus });
    toast({ title: `${d.name} set to ${newStatus}` });
  };

  const filtered = drivers.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Profiles"
        description="Performance and compliance management"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Driver</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>License #</Label><Input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
                </div>
                <div>
                  <Label>License Expiry</Label>
                  <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-2 block">Licensed For</Label>
                  <div className="flex gap-4">
                    {['Truck', 'Van', 'Bike'].map((cat) => (
                      <label key={cat} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <Checkbox checked={form.licenseCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full mt-2">Add Driver</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="On Duty">On Duty</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="Off Duty">Off Duty</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead className="hidden md:table-cell">License</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead className="hidden lg:table-cell">Completion Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const expired = isLicenseExpired(d.licenseExpiry);
                const expiringSoon = isLicenseExpiringSoon(d.licenseExpiry);
                const completionRate = d.tripsTotal > 0 ? Math.round((d.tripsCompleted / d.tripsTotal) * 100) : 0;
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.licenseCategories.join(', ')}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{d.licenseExpiry}</span>
                        {expired && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                        {expiringSoon && !expired && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${d.safetyScore >= 90 ? 'text-success' : d.safetyScore >= 70 ? 'text-warning' : 'text-destructive'}`} />
                        <span className="text-sm font-medium">{d.safetyScore}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2 min-w-24">
                        <Progress value={completionRate} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell><span className={getDriverStatusClass(d.status)}>{d.status}</span></TableCell>
                    <TableCell className="text-right">
                      <Select value={d.status} onValueChange={(v) => toggleStatus(d, v as DriverStatus)}>
                        <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="On Duty">On Duty</SelectItem>
                          <SelectItem value="Off Duty">Off Duty</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
