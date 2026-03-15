from django.db import models
from users.models import User
from orders.models import Order


class Inquiry(models.Model):
    STATUS_CHOICES = [
        ('open',     'Open'),
        ('replied',  'Replied'),
        ('closed',   'Closed'),
    ]

    buyer    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiries')
    order    = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='inquiries')
    subject  = models.CharField(max_length=255)
    message  = models.TextField()
    reply    = models.TextField(blank=True)
    status   = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Inquiry #{self.id} — {self.buyer.username} [{self.status}]"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Inquiries'