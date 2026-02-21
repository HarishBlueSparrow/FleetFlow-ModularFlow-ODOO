import { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/fleet/PageHeader';
import { useFleetStore } from '@/store/fleetStore';
import { formatCurrency } from '@/lib/fleet-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const logs = useFleetStore((s) => s.maintenanceLogs);
  const addLog = useFleetStore((s) => s.addMaintenanceLog);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', type: '', description: '', cost: 0, date: '', status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed' });

  const handleAdd = () => {
    if (!form.vehicleId || !form.type) {
      toast({ title: 'Error', description: 'Vehicle and type required', variant: 'destructive' });
      return;
    }
    addLog(form);
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    toast({ title: 'Maintenance logged', description: `${vehicle?.name} — ${form.type}` });
    setDialogOpen(false);
    setForm({ vehicleId: '', type: '', description: '', cost: 0, date: '', status: 'Scheduled' });
  };

  const statusClass = (s: string) => {
    switch (s) {
      case 'Completed': return 'status-available';
      case 'In Progress': return 'status-in-shop';
      case 'Scheduled': return 'status-pill bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const totalCost = logs.reduce((s, l) => s + l.cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance & Service Logs"
        description={`Total maintenance spend: ${formatCurrency(totalCost)}`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Log Service</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Maintenance Log</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <Label>Vehicle</Label>
                  <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.filter((v) => v.status !== 'Retired').map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Service Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Oil Change" /></div>
                  <div><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cost ($)</Label><Input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: +e.target.value })} /></div>
                  <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                </div>
                <Button onClick={handleAdd} className="w-full mt-2">Log Maintenance</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((log) => {
                const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{vehicle?.name || '—'}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">{log.description}</TableCell>
                    <TableCell>{formatCurrency(log.cost)}</TableCell>
                    <TableCell className="hidden md:table-cell">{log.date}</TableCell>
                    <TableCell><span className={statusClass(log.status)}>{log.status}</span></TableCell>
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
