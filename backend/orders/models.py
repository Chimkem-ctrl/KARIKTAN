from django.db import models
from users.models import User
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('processing', 'Processing'),
        ('shipped',    'Shipped'),
        ('delivered',  'Delivered'),
    ]

    buyer        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price  = models.DecimalField(max_digits=10, decimal_places=2)
    full_name    = models.CharField(max_length=255)
    address      = models.TextField()
    phone        = models.CharField(max_length=30)
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} — {self.buyer.username} [{self.status}]"

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order     = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product   = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name      = models.CharField(max_length=255)   # snapshot at purchase time
    price     = models.DecimalField(max_digits=10, decimal_places=2)
    quantity  = models.IntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.name}"

    @property
    def subtotal(self):
        return self.price * self.quantity