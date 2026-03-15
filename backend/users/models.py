from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('admin', 'Admin'),
    ]
    role            = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    phone           = models.CharField(max_length=20, blank=True)
    address         = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"