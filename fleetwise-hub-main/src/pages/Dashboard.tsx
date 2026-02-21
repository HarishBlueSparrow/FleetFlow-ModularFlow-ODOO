import { Truck, AlertTriangle, TrendingUp, Package, Fuel, Users, Route as RouteIcon, Wrench } from 'lucide-react';
import { KPICard } from '@/components/fleet/KPICard';
import { PageHeader } from '@/components/fleet/PageHeader';
import { useFleetStore } from '@/store/fleetStore';
import { motion } from 'framer-motion';
import { getVehicleStatusClass, getTripStatusClass, formatCurrency } from '@/lib/fleet-utils';

export default function DashboardPage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const drivers = useFleetStore((s) => s.drivers);
  const trips = useFleetStore((s) => s.trips);
  const maintenanceLogs = useFleetStore((s) => s.maintenanceLogs);
  const fuelLogs = useFleetStore((s) => s.fuelLogs);

  const activeFleet = vehicles.filter((v) => v.status === 'On Trip').length;
  const inShop = vehicles.filter((v) => v.status === 'In Shop').length;
  const available = vehicles.filter((v) => v.status === 'Available').length;
  const utilization = vehicles.length > 0 ? Math.round(((activeFleet) / (vehicles.length - vehicles.filter(v => v.status === 'Retired').length)) * 100) : 0;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const activeDrivers = drivers.filter((d) => d.status === 'On Duty' || d.status === 'On Trip').length;
  const recentTrips = trips.slice().sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Command Center" description="Fleet overview and real-time status" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Fleet" value={activeFleet} subtitle={`${vehicles.length} total vehicles`} icon={<Truck className="h-5 w-5" />} trend={{ value: 12, positive: true }} />
        <KPICard title="Maintenance Alerts" value={inShop} subtitle="Vehicles in shop" icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Utilization Rate" value={`${utilization}%`} subtitle={`${available} available`} icon={<TrendingUp className="h-5 w-5" />} trend={{ value: 5, positive: true }} />
        <KPICard title="Pending Cargo" value={pendingTrips} subtitle="Awaiting assignment" icon={<Package className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Fuel Spend (MTD)" value={formatCurrency(totalFuelCost)} icon={<Fuel className="h-5 w-5" />} />
        <KPICard title="Active Drivers" value={activeDrivers} subtitle={`${drivers.length} total`} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Trips This Month" value={trips.length} subtitle={`${trips.filter(t => t.status === 'Completed').length} completed`} icon={<RouteIcon className="h-5 w-5" />} />
      </div>

      {/* Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Trips</h3>
          <div className="space-y-3">
            {recentTrips.map((trip) => {
              const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
              const driver = drivers.find((d) => d.id === trip.driverId);
              return (
                <div key={trip.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{trip.origin} → {trip.destination}</p>
                    <p className="text-xs text-muted-foreground">{vehicle?.name} • {driver?.name}</p>
                  </div>
                  <span className={getTripStatusClass(trip.status)}>{trip.status}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Fleet Status</h3>
          <div className="space-y-3">
            {vehicles.slice(0, 6).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.licensePlate} • {vehicle.type}</p>
                </div>
                <span className={getVehicleStatusClass(vehicle.status)}>{vehicle.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
