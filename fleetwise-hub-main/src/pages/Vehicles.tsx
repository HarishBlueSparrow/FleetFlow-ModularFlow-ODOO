import { useState } from 'react';
import { Plus, Search, Truck as TruckIcon } from 'lucide-react';
import { PageHeader } from '@/components/fleet/PageHeader';
import { useFleetStore, Vehicle, VehicleType, VehicleStatus } from '@/store/fleetStore';
import { getVehicleStatusClass, formatNumber, formatCurrency } from '@/lib/fleet-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function VehiclesPage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const addVehicle = useFleetStore((s) => s.addVehicle);
  const updateVehicle = useFleetStore((s) => s.updateVehicle);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({ name: '', type: 'Van' as VehicleType, licensePlate: '', maxCapacity: 0, odometer: 0, region: '', acquisitionCost: 0 });

  const filtered = vehicles.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.licensePlate.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && v.type !== typeFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  const handleAdd = () => {
    if (!form.name || !form.licensePlate) {
      toast({ title: 'Error', description: 'Name and license plate required', variant: 'destructive' });
      return;
    }
    if (vehicles.some((v) => v.licensePlate === form.licensePlate)) {
      toast({ title: 'Error', description: 'License plate already exists', variant: 'destructive' });
      return;
    }
    addVehicle({ ...form, status: 'Available', addedDate: new Date().toISOString().split('T')[0] });
    toast({ title: 'Vehicle added', description: `${form.name} added to registry` });
    setDialogOpen(false);
    setForm({ name: '', type: 'Van', licensePlate: '', maxCapacity: 0, odometer: 0, region: '', acquisitionCost: 0 });
  };

  const toggleRetired = (v: Vehicle) => {
    const newStatus: VehicleStatus = v.status === 'Retired' ? 'Available' : 'Retired';
    updateVehicle(v.id, { status: newStatus });
    toast({ title: `Vehicle ${newStatus === 'Retired' ? 'retired' : 'reactivated'}` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Registry"
        description="Manage your fleet assets"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Vehicle</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name/Model</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Van-06" /></div>
                  <div><Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as VehicleType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>License Plate</Label><Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="e.g. VAN-6006" /></div>
                  <div><Label>Region</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. North" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Max Capacity (kg)</Label><Input type="number" value={form.maxCapacity || ''} onChange={(e) => setForm({ ...form, maxCapacity: +e.target.value })} /></div>
                  <div><Label>Odometer</Label><Input type="number" value={form.odometer || ''} onChange={(e) => setForm({ ...form, odometer: +e.target.value })} /></div>
                  <div><Label>Acquisition Cost</Label><Input type="number" value={form.acquisitionCost || ''} onChange={(e) => setForm({ ...form, acquisitionCost: +e.target.value })} /></div>
                </div>
                <Button onClick={handleAdd} className="w-full mt-2">Add Vehicle</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or plate..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Truck">Truck</SelectItem>
            <SelectItem value="Van">Van</SelectItem>
            <SelectItem value="Bike">Bike</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Capacity</TableHead>
                <TableHead className="hidden lg:table-cell">Odometer</TableHead>
                <TableHead className="hidden md:table-cell">Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="font-mono text-xs">{v.licensePlate}</TableCell>
                  <TableCell className="hidden md:table-cell">{v.type}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatNumber(v.maxCapacity)} kg</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatNumber(v.odometer)} km</TableCell>
                  <TableCell className="hidden md:table-cell">{v.region}</TableCell>
                  <TableCell><span className={getVehicleStatusClass(v.status)}>{v.status}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleRetired(v)}>
                      {v.status === 'Retired' ? 'Reactivate' : 'Retire'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No vehicles found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
