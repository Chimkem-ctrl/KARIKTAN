from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer


def is_admin(request):
    return request.user.is_authenticated and request.user.role == 'admin'

def is_buyer(request):
    return request.user.is_authenticated and request.user.role == 'buyer'


class OrderListCreateView(APIView):
    """
    GET  /api/orders/         — buyer sees own orders; admin sees all
    POST /api/orders/         — buyer creates an order
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        if is_admin(request):
            orders = Order.objects.all().select_related('buyer').prefetch_related('items')
        else:
            orders = Order.objects.filter(buyer=request.user).prefetch_related('items')
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        if not is_buyer(request):
            return Response({'error': 'Only buyers can place orders.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(APIView):
    """
    GET   /api/orders/<id>/          — buyer sees own; admin sees any
    PATCH /api/orders/<id>/status/   — admin only: update status
    """
    def get_object(self, pk, request):
        try:
            order = Order.objects.prefetch_related('items').get(pk=pk)
            if is_admin(request):
                return order
            if order.buyer == request.user:
                return order
            return None
        except Order.DoesNotExist:
            return None

    def get(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        order = self.get_object(pk, request)
        if not order:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)


class OrderStatusUpdateView(APIView):
    """PATCH /api/orders/<id>/status/ — admin only"""
    def patch(self, request, pk):
        if not is_admin(request):
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateOrderStatusSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(OrderSerializer(order).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnalyticsView(APIView):
    """GET /api/orders/analytics/ — admin only"""
    def get(self, request):
        if not is_admin(request):
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        orders = Order.objects.all()
        total_revenue  = orders.filter(status='delivered').aggregate(
            total=Sum('total_price'))['total'] or 0
        total_orders   = orders.count()
        pending_count  = orders.filter(status='pending').count()
        processing_count = orders.filter(status='processing').count()
        shipped_count  = orders.filter(status='shipped').count()
        delivered_count = orders.filter(status='delivered').count()

        # Top products by order item quantity
        from orders.models import OrderItem
        from django.db.models import Sum as S
        top_products = (
            OrderItem.objects
            .values('name')
            .annotate(total_sold=S('quantity'))
            .order_by('-total_sold')[:5]
        )

        # Recent orders
        recent = orders[:5]

        return Response({
            'total_revenue':    float(total_revenue),
            'total_orders':     total_orders,
            'status_breakdown': {
                'pending':    pending_count,
                'processing': processing_count,
                'shipped':    shipped_count,
                'delivered':  delivered_count,
            },
            'top_products': list(top_products),
            'recent_orders': OrderSerializer(recent, many=True).data,
        })