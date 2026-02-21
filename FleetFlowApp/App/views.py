import json
import datetime
from django.shortcuts import render, redirect
from django.urls import reverse
from django.core.mail import EmailMessage
from django.contrib.auth import get_user_model, authenticate, login
from django.conf import settings
from .models import Profile, Vehicle, Trip, cost, Repair, PasswordReset

User = get_user_model()

def get_status_style(status):
    status = status.lower()
    if status in ['available', 'active']:
        return 'bg-green-100 text-green-700 border-green-200'
    elif status in ['on trip', 'dispatched', 'on duty']:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    elif status == 'in shop':
        return 'bg-orange-100 text-orange-700 border-orange-200'
    elif status in ['suspended', 'cancelled', 'out of service']:
        return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'

def index_view(r):
    # Ensure the user is logged in
    if not r.user.is_authenticated:
        return redirect("/login")

    try:
        profile = Profile.objects.get(user=r.user)
    except Profile.DoesNotExist:
        return redirect("/login")

    # 1. Map Vehicle models for template matching JS needs
    vehicles_qs = Vehicle.objects.all()
    vehicles = [
        {
            "id": str(v.id), 
            "name": v.name, 
            "plate": v.license_plate, 
            "capacity": v.max_load_capacity, 
            "odometer": v.odometer_reading, 
            "status": v.status.title(),
        } for v in vehicles_qs
    ]

    # 2. Fetch Drivers from Database Profile Model
    today_str = datetime.date.today().isoformat()
    driver_profiles = Profile.objects.filter(role__in=['driver', 'Dispatcher', 'Driver'])
    
    drivers = []
    for dp in driver_profiles:
        assigned_vehicles = dp.vehicle_set.all()
        current_status = 'Available'
        if assigned_vehicles.filter(status__iexact='on trip').exists():
            current_status = 'On Duty'

        mock_expiry = "2028-01-01" 
        mock_score = 95

        drivers.append({
            "id": str(dp.id),
            "name": dp.user.username,
            "status": current_status,
            "licenseExpiry": mock_expiry,
            "safetyScore": mock_score,
        })

    # 3. Map Trips matching JS needs
    trips_qs = Trip.objects.all()
    trips = []
    for t in trips_qs:
        trips.append({
            "id": str(t.id),
            "vehicleId": str(t.vehicle.id) if t.vehicle else "",
            "driverId": str(t.vehicle.driver.id) if (t.vehicle and t.vehicle.driver) else "",
            "status": "Completed" if t.end_time else "Dispatched",
            "cargoWeight": t.vehicle.max_load_capacity if t.vehicle else 0, # Placeholder load
            "date": t.start_time.strftime("%Y-%m-%d") if t.start_time else ""
        })

    # 4. Map Repairs matching JS needs
    repairs_qs = Repair.objects.all()
    maintenanceLogs = [
        {
            "id": str(rep.id),
            "vehicleId": str(rep.vehicle.id) if rep.vehicle else "",
            "type": rep.reason,
            "cost": rep.cost,
            "date": rep.date.strftime("%Y-%m-%d") if rep.date else ""
        } for rep in repairs_qs
    ]

    # 5. Map Cost -> Fuel Logs
    costs_qs = cost.objects.all()
    fuelLogs = [
        {
            "id": str(c.id),
            "vehicleId": str(c.trip.vehicle.id) if (c.trip and c.trip.vehicle) else "",
            "liters": 0, # Fuel model doesn't explicitly have liters yet, defaulting to 0
            "cost": c.fuel_cost,
            "date": c.trip.start_time.strftime("%Y-%m-%d") if (c.trip and c.trip.start_time) else ""
        } for c in costs_qs
    ]

    # JSON serialize strings safely for frontend state object initialization
    context = {
        "prof": profile,
        "vehicles": json.dumps(vehicles),
        "drivers": json.dumps(drivers),
        "trips": json.dumps(trips),
        "maintenanceLogs": json.dumps(maintenanceLogs),
        "fuelLogs": json.dumps(fuelLogs)
    }
    return render(r, "index.html", context)

def reg_view(r):
    if r.method == "POST":
        username = r.POST.get("username")
        email = r.POST.get("email")
        password = r.POST.get("password")
        cpassword = r.POST.get("confirm_password")

        if not User.objects.filter(username=username).exists() and not User.objects.filter(email=email).exists() and password == cpassword:
            new_user = User.objects.create_user(username=username, email=email, password=password)
            new_user.save()

            profile_for_new_user = Profile.objects.create(user=new_user)
            profile_for_new_user.role = "User"
            profile_for_new_user.save()

            return redirect("/login")

    return render(r, "reg.html")

def login_view(r):
    if r.method == "POST":
        username = r.POST.get("username")
        password = r.POST.get("password")

        user = authenticate(r, username=username, password=password)

        if user is not None:
            login(r, user=user)    
            return redirect("/")
    return render(r, "login.html")

def ForgotPassword(r):
    if r.method == "POST":
        email = r.POST.get("email")

        try:
            user = User.objects.get(email=email)

            new_pass_reset = PasswordReset.objects.create(user=user)
            new_pass_reset.save()

            password_reset_url = reverse("reset-password", kwargs={"reset_id": new_pass_reset.reset_id})
            full_password_reset_url = f"{r.scheme}://{r.get_host()}{password_reset_url}"

            email_body = f"""
you can reset your password to your join the realm account using the link below.......
|           ___________
|         /             \\
|        /               \\   
|       |    |     |     |
|       |                |
|       |   \\_______/    |
|        \\              /
|         \\------------/
|           
v
{full_password_reset_url}
"""
            email_message = EmailMessage(
                "reset your password",
                email_body,
                settings.EMAIL_HOST_USER,
                [email]
            )
            
            email_message.fail_silently = True
            email_message.send()
            return redirect(f"/reset-link-sent/{new_pass_reset.reset_id}")

        except User.DoesNotExist:
            return redirect("/")

    return render(r, "forget_password.html")

def reset_link_sent(r, reset_id):
    return render(r, "password_reset_sent.html")

def password_reset(r, reset_id):
    try:
        password_reset = PasswordReset.objects.get(reset_id=reset_id)
        user = password_reset.user

        if r.method == "POST":
            password = r.POST.get("password")
            cpassword = r.POST.get("confirm_password")

            if password == cpassword:
                user.set_password(password)
                user.save()
                password_reset.delete()
                return redirect("/login")
            
            return redirect("/")
        
    except PasswordReset.DoesNotExist:
        return redirect("/")

    return render(r, "password_reset.html")