from django.db import models
from django.contrib.auth.models import User
import uuid


# Create your models here.
class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"user {self.user.username} requested to reset his/her password at {self.date}"

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    Role = [
        ('User', 'user'),
        ('Fleet Manager', 'Fm'),
        ('Dispatcher', 'driver'),
        ('Safty Officer', 'so'),
        ('Financial Analyst', 'Fa'),
    ]
    role = models.TextField(choices=Role, default="")

    
    def __str__(self):
        return f"{self.user.username}'s profile"

class Vehicle(models.Model):
    name = models.CharField(max_length=100)
    driver = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'driver'})
    year = models.IntegerField()
    max_load_capacity = models.FloatField()
    odometer_reading = models.FloatField()
    license_plate = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, default="available")
    is_out_of_service = models.BooleanField(default=False)
    safty_score = models.FloatField(default=100.0)

    def __str__(self):
        return f"{self.name} ({self.license_plate})"

class Trip(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    start_location = models.CharField(max_length=100)
    end_location = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    distance_traveled = models.FloatField()

    def __str__(self):
        return f"Trip for {self.vehicle.name} from {self.start_location} to {self.end_location}"
    
class  cost(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    fuel_cost = models.FloatField()
    maintenance_cost = models.FloatField()
    other_costs = models.FloatField()

    def __str__(self):
        return f"Cost for {self.trip}"

class Repair(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    reason = models.TextField()
    cost = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Repair for {self.vehicle.name} on {self.date}"