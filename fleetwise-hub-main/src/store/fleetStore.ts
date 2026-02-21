import { create } from 'zustand';

// This is a temporary mock data store. Will be replaced with Supabase backend.

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type DriverStatus = 'On Duty' | 'Off Duty' | 'Suspended' | 'On Trip';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
export type VehicleType = 'Truck' | 'Van' | 'Bike';
export type UserRole = 'manager' | 'dispatcher' | 'safety_officer' | 'analyst';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  maxCapacity: number;
  odometer: number;
  status: VehicleStatus;
  region: string;
  acquisitionCost: number;
  addedDate: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategories: VehicleType[];
  status: DriverStatus;
  safetyScore: number;
  tripsCompleted: number;
  tripsTotal: number;
  joinedDate: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  cargoDescription: string;
  status: TripStatus;
  createdDate: string;
  completedDate?: string;
  startOdometer?: number;
  endOdometer?: number;
  revenue: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date: string;
  odometer: number;
}

const mockVehicles: Vehicle[] = [
  { id: 'v1', name: 'Truck-01', type: 'Truck', licensePlate: 'TRK-1001', maxCapacity: 5000, odometer: 125400, status: 'On Trip', region: 'North', acquisitionCost: 85000, addedDate: '2023-01-15' },
  { id: 'v2', name: 'Van-05', type: 'Van', licensePlate: 'VAN-5005', maxCapacity: 500, odometer: 67200, status: 'Available', region: 'East', acquisitionCost: 35000, addedDate: '2023-03-22' },
  { id: 'v3', name: 'Truck-02', type: 'Truck', licensePlate: 'TRK-1002', maxCapacity: 8000, odometer: 210300, status: 'In Shop', region: 'North', acquisitionCost: 95000, addedDate: '2022-06-10' },
  { id: 'v4', name: 'Bike-01', type: 'Bike', licensePlate: 'BKE-2001', maxCapacity: 20, odometer: 15400, status: 'Available', region: 'South', acquisitionCost: 5000, addedDate: '2024-01-05' },
  { id: 'v5', name: 'Van-02', type: 'Van', licensePlate: 'VAN-5002', maxCapacity: 600, odometer: 89100, status: 'On Trip', region: 'West', acquisitionCost: 38000, addedDate: '2023-07-18' },
  { id: 'v6', name: 'Truck-03', type: 'Truck', licensePlate: 'TRK-1003', maxCapacity: 10000, odometer: 45600, status: 'Available', region: 'South', acquisitionCost: 110000, addedDate: '2024-05-01' },
  { id: 'v7', name: 'Van-03', type: 'Van', licensePlate: 'VAN-5003', maxCapacity: 450, odometer: 102000, status: 'Retired', region: 'East', acquisitionCost: 32000, addedDate: '2021-11-20' },
  { id: 'v8', name: 'Bike-02', type: 'Bike', licensePlate: 'BKE-2002', maxCapacity: 25, odometer: 8700, status: 'On Trip', region: 'North', acquisitionCost: 5500, addedDate: '2024-03-12' },
];

const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Alex Johnson', email: 'alex@fleet.com', phone: '+1-555-0101', licenseNumber: 'DL-001', licenseExpiry: '2026-08-15', licenseCategories: ['Truck', 'Van'], status: 'On Trip', safetyScore: 92, tripsCompleted: 145, tripsTotal: 150, joinedDate: '2022-03-01' },
  { id: 'd2', name: 'Maria Santos', email: 'maria@fleet.com', phone: '+1-555-0102', licenseNumber: 'DL-002', licenseExpiry: '2025-12-01', licenseCategories: ['Van', 'Bike'], status: 'On Duty', safetyScore: 97, tripsCompleted: 210, tripsTotal: 215, joinedDate: '2021-07-15' },
  { id: 'd3', name: 'James Wilson', email: 'james@fleet.com', phone: '+1-555-0103', licenseNumber: 'DL-003', licenseExpiry: '2025-03-10', licenseCategories: ['Truck'], status: 'Off Duty', safetyScore: 78, tripsCompleted: 89, tripsTotal: 102, joinedDate: '2023-01-20' },
  { id: 'd4', name: 'Sarah Chen', email: 'sarah@fleet.com', phone: '+1-555-0104', licenseNumber: 'DL-004', licenseExpiry: '2027-06-20', licenseCategories: ['Truck', 'Van', 'Bike'], status: 'On Trip', safetyScore: 95, tripsCompleted: 178, tripsTotal: 180, joinedDate: '2022-09-05' },
  { id: 'd5', name: 'Mike Brown', email: 'mike@fleet.com', phone: '+1-555-0105', licenseNumber: 'DL-005', licenseExpiry: '2024-11-30', licenseCategories: ['Bike'], status: 'Suspended', safetyScore: 55, tripsCompleted: 45, tripsTotal: 60, joinedDate: '2023-06-10' },
];

const mockTrips: Trip[] = [
  { id: 't1', vehicleId: 'v1', driverId: 'd1', origin: 'Warehouse A', destination: 'Distribution Center B', cargoWeight: 4500, cargoDescription: 'Electronics', status: 'Dispatched', createdDate: '2026-02-20', revenue: 2500, startOdometer: 125000 },
  { id: 't2', vehicleId: 'v5', driverId: 'd4', origin: 'Port Terminal', destination: 'Retail Hub C', cargoWeight: 450, cargoDescription: 'Textiles', status: 'Dispatched', createdDate: '2026-02-19', revenue: 800, startOdometer: 88900 },
  { id: 't3', vehicleId: 'v8', driverId: 'd2', origin: 'Store D', destination: 'Customer E', cargoWeight: 15, cargoDescription: 'Documents', status: 'Dispatched', createdDate: '2026-02-21', revenue: 50, startOdometer: 8600 },
  { id: 't4', vehicleId: 'v2', driverId: 'd2', origin: 'Warehouse A', destination: 'Market F', cargoWeight: 380, cargoDescription: 'Food Supplies', status: 'Completed', createdDate: '2026-02-15', completedDate: '2026-02-16', revenue: 650, startOdometer: 66800, endOdometer: 67200 },
  { id: 't5', vehicleId: 'v6', driverId: 'd3', origin: 'Factory G', destination: 'Depot H', cargoWeight: 7500, cargoDescription: 'Machinery Parts', status: 'Completed', createdDate: '2026-02-10', completedDate: '2026-02-12', revenue: 4200, startOdometer: 44800, endOdometer: 45600 },
  { id: 't6', vehicleId: 'v4', driverId: 'd5', origin: 'Office I', destination: 'Client J', cargoWeight: 10, cargoDescription: 'Samples', status: 'Cancelled', createdDate: '2026-02-18', revenue: 0 },
];

const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: 'm1', vehicleId: 'v3', type: 'Oil Change', description: 'Full synthetic oil change + filter replacement', cost: 350, date: '2026-02-19', status: 'In Progress' },
  { id: 'm2', vehicleId: 'v1', type: 'Tire Rotation', description: 'Rotate and balance all tires', cost: 200, date: '2026-02-05', status: 'Completed' },
  { id: 'm3', vehicleId: 'v5', type: 'Brake Inspection', description: 'Full brake system inspection and pad replacement', cost: 800, date: '2026-01-28', status: 'Completed' },
  { id: 'm4', vehicleId: 'v2', type: 'Engine Tune-up', description: 'Scheduled 50k service tune-up', cost: 600, date: '2026-03-01', status: 'Scheduled' },
  { id: 'm5', vehicleId: 'v7', type: 'Transmission Repair', description: 'Major transmission overhaul', cost: 4500, date: '2026-01-15', status: 'Completed' },
];

const mockFuelLogs: FuelLog[] = [
  { id: 'f1', vehicleId: 'v1', tripId: 't1', liters: 120, cost: 180, date: '2026-02-20', odometer: 125200 },
  { id: 'f2', vehicleId: 'v5', tripId: 't2', liters: 45, cost: 67.5, date: '2026-02-19', odometer: 89000 },
  { id: 'f3', vehicleId: 'v2', tripId: 't4', liters: 38, cost: 57, date: '2026-02-15', odometer: 67000 },
  { id: 'f4', vehicleId: 'v6', tripId: 't5', liters: 180, cost: 270, date: '2026-02-10', odometer: 45200 },
  { id: 'f5', vehicleId: 'v8', liters: 5, cost: 7.5, date: '2026-02-18', odometer: 8650 },
  { id: 'f6', vehicleId: 'v1', liters: 110, cost: 165, date: '2026-02-12', odometer: 124800 },
  { id: 'f7', vehicleId: 'v3', liters: 150, cost: 225, date: '2026-02-08', odometer: 210000 },
];

interface FleetStore {
  // Auth
  isAuthenticated: boolean;
  userRole: UserRole;
  userName: string;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;

  // Data
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];

  // Vehicle actions
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;

  // Driver actions
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;

  // Trip actions
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;

  // Maintenance actions
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;

  // Fuel actions
  addFuelLog: (log: Omit<FuelLog, 'id'>) => void;
}

let idCounter = 100;
const genId = (prefix: string) => `${prefix}${++idCounter}`;

export const useFleetStore = create<FleetStore>((set, get) => ({
  isAuthenticated: false,
  userRole: 'manager',
  userName: '',
  login: (email, _password, role) => {
    set({ isAuthenticated: true, userRole: role, userName: email.split('@')[0] });
    return true;
  },
  logout: () => set({ isAuthenticated: false, userName: '', userRole: 'manager' }),

  vehicles: mockVehicles,
  drivers: mockDrivers,
  trips: mockTrips,
  maintenanceLogs: mockMaintenanceLogs,
  fuelLogs: mockFuelLogs,

  addVehicle: (vehicle) => set((s) => ({ vehicles: [...s.vehicles, { ...vehicle, id: genId('v') }] })),
  updateVehicle: (id, updates) => set((s) => ({ vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...updates } : v) })),

  addDriver: (driver) => set((s) => ({ drivers: [...s.drivers, { ...driver, id: genId('d') }] })),
  updateDriver: (id, updates) => set((s) => ({ drivers: s.drivers.map((d) => d.id === id ? { ...d, ...updates } : d) })),

  addTrip: (trip) => {
    const state = get();
    const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = state.drivers.find((d) => d.id === trip.driverId);
    if (vehicle && trip.status === 'Dispatched') {
      set((s) => ({
        vehicles: s.vehicles.map((v) => v.id === trip.vehicleId ? { ...v, status: 'On Trip' as VehicleStatus } : v),
        drivers: s.drivers.map((d) => d.id === trip.driverId ? { ...d, status: 'On Trip' as DriverStatus } : d),
      }));
    }
    set((s) => ({ trips: [...s.trips, { ...trip, id: genId('t') }] }));
  },
  updateTrip: (id, updates) => {
    const state = get();
    const trip = state.trips.find((t) => t.id === id);
    if (trip && updates.status === 'Completed') {
      set((s) => ({
        vehicles: s.vehicles.map((v) => v.id === trip.vehicleId ? { ...v, status: 'Available' as VehicleStatus, odometer: updates.endOdometer || v.odometer } : v),
        drivers: s.drivers.map((d) => d.id === trip.driverId ? { ...d, status: 'On Duty' as DriverStatus, tripsCompleted: d.tripsCompleted + 1 } : d),
      }));
    }
    if (trip && updates.status === 'Cancelled') {
      set((s) => ({
        vehicles: s.vehicles.map((v) => v.id === trip.vehicleId && v.status === 'On Trip' ? { ...v, status: 'Available' as VehicleStatus } : v),
        drivers: s.drivers.map((d) => d.id === trip.driverId && d.status === 'On Trip' ? { ...d, status: 'On Duty' as DriverStatus } : d),
      }));
    }
    set((s) => ({ trips: s.trips.map((t) => t.id === id ? { ...t, ...updates } : t) }));
  },

  addMaintenanceLog: (log) => {
    if (log.status === 'In Progress' || log.status === 'Scheduled') {
      set((s) => ({
        vehicles: s.vehicles.map((v) => v.id === log.vehicleId ? { ...v, status: 'In Shop' as VehicleStatus } : v),
      }));
    }
    set((s) => ({ maintenanceLogs: [...s.maintenanceLogs, { ...log, id: genId('m') }] }));
  },

  addFuelLog: (log) => set((s) => ({ fuelLogs: [...s.fuelLogs, { ...log, id: genId('f') }] })),
}));
