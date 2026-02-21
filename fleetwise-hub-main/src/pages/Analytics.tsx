import { PageHeader } from '@/components/fleet/PageHeader';
import { KPICard } from '@/components/fleet/KPICard';
import { useFleetStore } from '@/store/fleetStore';
import { formatCurrency, formatNumber } from '@/lib/fleet-utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Fuel, DollarSign, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['hsl(152,60%,40%)', 'hsl(38,92%,50%)', 'hsl(210,80%,52%)', 'hsl(0,72%,51%)', 'hsl(280,60%,50%)'];

export default function AnalyticsPage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const trips = useFleetStore((s) => s.trips);
  const fuelLogs = useFleetStore((s) => s.fuelLogs);
  const maintenanceLogs = useFleetStore((s) => s.maintenanceLogs);

  const completedTrips = trips.filter((t) => t.status === 'Completed');
  const totalRevenue = completedTrips.reduce((s, t) => s + t.revenue, 0);
  const totalFuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalMaint = maintenanceLogs.reduce((s, m) => s + m.cost, 0);

  // Fuel efficiency per vehicle
  const fuelEfficiency = vehicles.map((v) => {
    const vFuel = fuelLogs.filter((f) => f.vehicleId === v.id);
    const totalLiters = vFuel.reduce((s, f) => s + f.liters, 0);
    const vTrips = completedTrips.filter((t) => t.vehicleId === v.id);
    const totalKm = vTrips.reduce((s, t) => (t.endOdometer && t.startOdometer ? s + (t.endOdometer - t.startOdometer) : s), 0);
    return { name: v.name, kmpL: totalLiters > 0 ? +(totalKm / totalLiters).toFixed(1) : 0, cost: vFuel.reduce((s, f) => s + f.cost, 0) };
  }).filter((d) => d.kmpL > 0 || d.cost > 0);

  // Vehicle ROI
  const vehicleROI = vehicles.map((v) => {
    const rev = completedTrips.filter((t) => t.vehicleId === v.id).reduce((s, t) => s + t.revenue, 0);
    const fuel = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0);
    const maint = maintenanceLogs.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const roi = v.acquisitionCost > 0 ? +(((rev - fuel - maint) / v.acquisitionCost) * 100).toFixed(1) : 0;
    return { name: v.name, roi, revenue: rev, expenses: fuel + maint };
  }).filter((d) => d.revenue > 0 || d.expenses > 0);

  // Status distribution
  const statusData = [
    { name: 'Available', value: vehicles.filter((v) => v.status === 'Available').length },
    { name: 'On Trip', value: vehicles.filter((v) => v.status === 'On Trip').length },
    { name: 'In Shop', value: vehicles.filter((v) => v.status === 'In Shop').length },
    { name: 'Retired', value: vehicles.filter((v) => v.status === 'Retired').length },
  ].filter((d) => d.value > 0);

  const exportCSV = () => {
    const rows = [['Vehicle', 'Fuel Cost', 'Maintenance Cost', 'Revenue', 'ROI %']];
    vehicleROI.forEach((v) => rows.push([v.name, '', '', String(v.revenue), String(v.roi)]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fleet-report.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Data-driven fleet insights"
        actions={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="h-5 w-5" />} trend={{ value: 18, positive: true }} />
        <KPICard title="Total Fuel Spend" value={formatCurrency(totalFuel)} icon={<Fuel className="h-5 w-5" />} />
        <KPICard title="Total Maintenance" value={formatCurrency(totalMaint)} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Net Profit" value={formatCurrency(totalRevenue - totalFuel - totalMaint)} icon={<Gauge className="h-5 w-5" />} trend={{ value: totalRevenue - totalFuel - totalMaint > 0 ? 8 : -5, positive: totalRevenue - totalFuel - totalMaint > 0 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fuel Efficiency (km/L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="kmpL" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Fleet Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fleet Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Vehicle ROI */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Vehicle ROI</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vehicleROI}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
