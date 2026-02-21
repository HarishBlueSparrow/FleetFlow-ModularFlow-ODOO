import { VehicleStatus, DriverStatus, TripStatus } from '@/store/fleetStore';

export function getVehicleStatusClass(status: VehicleStatus) {
  switch (status) {
    case 'Available': return 'status-available';
    case 'On Trip': return 'status-on-trip';
    case 'In Shop': return 'status-in-shop';
    case 'Retired': return 'status-retired';
  }
}

export function getDriverStatusClass(status: DriverStatus) {
  switch (status) {
    case 'On Duty': return 'status-available';
    case 'On Trip': return 'status-on-trip';
    case 'Off Duty': return 'status-in-shop';
    case 'Suspended': return 'status-retired';
  }
}

export function getTripStatusClass(status: TripStatus) {
  switch (status) {
    case 'Draft': return 'status-pill bg-muted text-muted-foreground';
    case 'Dispatched': return 'status-on-trip';
    case 'Completed': return 'status-available';
    case 'Cancelled': return 'status-retired';
  }
}

export function isLicenseExpired(expiryDate: string) {
  return new Date(expiryDate) < new Date();
}

export function isLicenseExpiringSoon(expiryDate: string) {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= 90;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}
