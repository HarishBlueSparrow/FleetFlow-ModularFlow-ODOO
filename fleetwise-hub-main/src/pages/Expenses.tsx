import { useState } from 'react';
import { Plus, Fuel } from 'lucide-react';
import { PageHeader } from '@/components/fleet/PageHeader';
import { KPICard } from '@/components/fleet/KPICard';
import { useFleetStore } from '@/store/fleetStore';
import { formatCurrency, formatNumber } from '@/lib/fleet-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { DollarSign, Wrench as WrenchIcon } from 'lucide-react';

export default function ExpensesPage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const fuelLogs = useFleetStore((s) => s.fuelLogs);
  const maintenanceLogs = useFleetStore((s) => s.maintenanceLogs);
  const trips = useFleetStore((s) => s.trips);
  const addFuelLog = useFleetStore((s) => s.addFuelLog);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [form, setForm] = useState({ vehicleId: '', liters: 0, cost: 0, date: '', odometer: 0 });

  const handleAdd = () => {
    if (!form.vehicleId || !form.liters || !form.cost) {
      toast({ title: 'Error', description: 'Vehicle, liters, and cost required', variant: 'destructive' });
      return;
    }
    addFuelLog(form);
    toast({ title: 'Fuel log added' });
    setDialogOpen(false);
    setForm({ vehicleId: '', liters: 0, cost: 0, date: '', odometer: 0 });
  };

  const totalFuelCost = fuelLogs.reduce((s, l) => s + l.cost, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((s, l) => s + l.cost, 0);
  const totalLiters = fuelLogs.reduce((s, l) => s + l.liters, 0);

  // Per-vehicle cost summary
  const vehicleCosts = vehicles.map((v) => {
    const fuel = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
    const maint = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const revenue = trips.filter((t) => t.vehicleId === v.id && t.status === 'Completed').reduce((s, t) => s + t.revenue, 0);
    return { vehicle: v, fuel, maintenance: maint, total: fuel + maint, revenue };
  });

  const filteredFuel = vehicleFilter === 'all' ? fuelLogs : fuelLogs.filter((f) => f.vehicleId === vehicleFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses & Fuel Logging"
        description="Track fuel consumption and operational costs"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Log Fuel</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Fuel Log</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <Label>Vehicle</Label>
                  <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Liters</Label><Input type="number" value={form.liters || ''} onChange={(e) => setForm({ ...form, liters: +e.target.value })} /></div>
                  <div><Label>Cost ($)</Label><Input type="number" value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: +e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div><Label>Odometer</Label><Input type="number" value={form.odometer || ''} onChange={(e) => setForm({ ...form, odometer: +e.target.value })} /></div>
                </div>
                <Button onClick={handleAdd} className="w-full mt-2">Log Fuel</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Fuel Cost" value={formatCurrency(totalFuelCost)} icon={<Fuel className="h-5 w-5" />} />
        <KPICard title="Total Maintenance" value={formatCurrency(totalMaintenanceCost)} icon={<WrenchIcon className="h-5 w-5" />} />
        <KPICard title="Total Operational" value={formatCurrency(totalFuelCost + totalMaintenanceCost)} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Per-vehicle cost summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Cost Per Vehicle</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead className="hidden md:table-cell">Revenue</TableHead>
                <TableHead className="hidden md:table-cell">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleCosts.filter((vc) => vc.total > 0 || vc.revenue > 0).map((vc) => (
                <TableRow key={vc.vehicle.id}>
                  <TableCell className="font-medium">{vc.vehicle.name}</TableCell>
                  <TableCell>{formatCurrency(vc.fuel)}</TableCell>
                  <TableCell>{formatCurrency(vc.maintenance)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(vc.total)}</TableCell>
                  <TableCell className="hidden md:table-cell text-success">{formatCurrency(vc.revenue)}</TableCell>
                  <TableCell className={`hidden md:table-cell font-semibold ${vc.revenue - vc.total >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(vc.revenue - vc.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Fuel logs */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-foreground">Fuel Logs</h3>
        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="hidden md:table-cell">Odometer</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...filteredFuel].sort((a, b) => b.date.localeCompare(a.date)).map((f) => {
                const vehicle = vehicles.find((v) => v.id === f.vehicleId);
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{vehicle?.name || '—'}</TableCell>
                    <TableCell>{f.liters} L</TableCell>
                    <TableCell>{formatCurrency(f.cost)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatNumber(f.odometer)} km</TableCell>
                    <TableCell>{f.date}</TableCell>
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
