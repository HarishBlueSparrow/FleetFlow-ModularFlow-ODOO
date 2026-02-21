import { useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/fleet/PageHeader';
import { useFleetStore, TripStatus } from '@/store/fleetStore';
import { getTripStatusClass, formatNumber, isLicenseExpired } from '@/lib/fleet-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function TripsPage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const drivers = useFleetStore((s) => s.drivers);
  const trips = useFleetStore((s) => s.trips);
  const addTrip = useFleetStore((s) => s.addTrip);
  const updateTrip = useFleetStore((s) => s.updateTrip);
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [completeDialog, setCompleteDialog] = useState<string | null>(null);
  const [endOdometer, setEndOdometer] = useState(0);

  const [form, setForm] = useState({
    vehicleId: '', driverId: '', origin: '', destination: '',
    cargoWeight: 0, cargoDescription: '', revenue: 0,
  });

  const [validationError, setValidationError] = useState('');

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => (d.status === 'On Duty') && !isLicenseExpired(d.licenseExpiry));

  const handleCreate = () => {
    setValidationError('');
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      setValidationError('All fields are required');
      return;
    }
    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    if (!vehicle) return;

    if (form.cargoWeight > vehicle.maxCapacity) {
      setValidationError(`Cargo (${form.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`);
      return;
    }

    const driver = drivers.find((d) => d.id === form.driverId);
    if (driver && !driver.licenseCategories.includes(vehicle.type)) {
      setValidationError(`Driver ${driver.name} is not licensed for ${vehicle.type}`);
      return;
    }

    addTrip({
      ...form,
      status: 'Dispatched',
      createdDate: new Date().toISOString().split('T')[0],
      revenue: form.revenue,
      startOdometer: vehicle.odometer,
    });
    toast({ title: 'Trip dispatched', description: `${form.origin} → ${form.destination}` });
    setDialogOpen(false);
    setForm({ vehicleId: '', driverId: '', origin: '', destination: '', cargoWeight: 0, cargoDescription: '', revenue: 0 });
  };

  const handleComplete = (tripId: string) => {
    updateTrip(tripId, { status: 'Completed', completedDate: new Date().toISOString().split('T')[0], endOdometer });
    toast({ title: 'Trip completed' });
    setCompleteDialog(null);
  };

  const filtered = trips.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search) {
      const v = vehicles.find((vv) => vv.id === t.vehicleId);
      const d = drivers.find((dd) => dd.id === t.driverId);
      const s = search.toLowerCase();
      if (!t.origin.toLowerCase().includes(s) && !t.destination.toLowerCase().includes(s) && !(v?.name.toLowerCase().includes(s)) && !(d?.name.toLowerCase().includes(s))) return false;
    }
    return true;
  }).sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Dispatcher"
        description="Create and manage trips"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Trip</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create New Trip</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                {validationError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {validationError}
                  </div>
                )}
                <div>
                  <Label>Vehicle</Label>
                  <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select available vehicle" /></SelectTrigger>
                    <SelectContent>
                      {availableVehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name} ({v.licensePlate}) — {v.maxCapacity}kg</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Driver</Label>
                  <Select value={form.driverId} onValueChange={(v) => setForm({ ...form, driverId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select available driver" /></SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name} — {d.licenseCategories.join(', ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Origin</Label><Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="From" /></div>
                  <div><Label>Destination</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="To" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Cargo Weight (kg)</Label><Input type="number" value={form.cargoWeight || ''} onChange={(e) => setForm({ ...form, cargoWeight: +e.target.value })} /></div>
                  <div><Label>Description</Label><Input value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} /></div>
                  <div><Label>Revenue ($)</Label><Input type="number" value={form.revenue || ''} onChange={(e) => setForm({ ...form, revenue: +e.target.value })} /></div>
                </div>
                <Button onClick={handleCreate} className="w-full mt-2">Dispatch Trip</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Dispatched">Dispatched</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead className="hidden md:table-cell">Vehicle</TableHead>
                <TableHead className="hidden md:table-cell">Driver</TableHead>
                <TableHead className="hidden lg:table-cell">Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const vehicle = vehicles.find((v) => v.id === t.vehicleId);
                const driver = drivers.find((d) => d.id === t.driverId);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{t.origin} → {t.destination}</p>
                      <p className="text-xs text-muted-foreground">{t.createdDate}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{vehicle?.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{driver?.name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatNumber(t.cargoWeight)} kg</TableCell>
                    <TableCell><span className={getTripStatusClass(t.status)}>{t.status}</span></TableCell>
                    <TableCell className="text-right">
                      {t.status === 'Dispatched' && (
                        <div className="flex gap-1 justify-end">
                          <Dialog open={completeDialog === t.id} onOpenChange={(open) => setCompleteDialog(open ? t.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">Complete</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Complete Trip</DialogTitle></DialogHeader>
                              <div className="space-y-3 py-2">
                                <div><Label>Final Odometer Reading</Label><Input type="number" value={endOdometer || ''} onChange={(e) => setEndOdometer(+e.target.value)} /></div>
                                <Button onClick={() => handleComplete(t.id)} className="w-full">Mark Complete</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { updateTrip(t.id, { status: 'Cancelled' }); toast({ title: 'Trip cancelled' }); }}>Cancel</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No trips found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
