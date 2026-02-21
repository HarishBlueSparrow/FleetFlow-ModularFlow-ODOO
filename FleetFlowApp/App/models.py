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
