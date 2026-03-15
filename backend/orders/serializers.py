from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'name', 'price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items       = OrderItemSerializer(many=True, read_only=True)
    buyer_name  = serializers.CharField(source='buyer.username', read_only=True)
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'buyer_email',
            'status', 'total_price',
            'full_name', 'address', 'phone', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'buyer_name', 'buyer_email', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model  = Order
        fields = ['full_name', 'address', 'phone', 'notes', 'items']

    def create(self, validated_data):
        from products.models import Product
        items_data  = validated_data.pop('items')
        buyer       = self.context['request'].user
        total_price = sum(
            float(i.get('price', 0)) * int(i.get('quantity', 1))
            for i in items_data
        )
        order = Order.objects.create(buyer=buyer, total_price=total_price, **validated_data)

        for item in items_data:
            product = None
            try:
                product = Product.objects.get(id=item['product_id'])
                # Reduce stock
                product.stock = max(0, product.stock - int(item.get('quantity', 1)))
                product.save()
            except Product.DoesNotExist:
                pass

            OrderItem.objects.create(
                order    = order,
                product  = product,
                name     = item.get('name', ''),
                price    = item.get('price', 0),
                quantity = item.get('quantity', 1),
            )

        return order


class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Order
        fields = ['status']