from django.urls import path
from .views import OrderListCreateView, OrderDetailView, OrderStatusUpdateView, AnalyticsView

urlpatterns = [
    path('',              OrderListCreateView.as_view(),  name='order-list'),
    path('<int:pk>/',     OrderDetailView.as_view(),       name='order-detail'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status'),
    path('analytics/',   AnalyticsView.as_view(),          name='analytics'),
]