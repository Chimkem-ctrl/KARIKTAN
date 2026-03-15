from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('bags', 'Bags'),
        ('shoes', 'Shoes'),
        ('wallets', 'Wallets'),
        ('pouch', 'Pouch'),
        ('jackets', 'Jackets'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='bags')
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

    class Meta:
        ordering = ['-created_at']