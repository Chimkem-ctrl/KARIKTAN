from rest_framework import serializers
from .models import Inquiry


class InquirySerializer(serializers.ModelSerializer):
    buyer_name  = serializers.CharField(source='buyer.username', read_only=True)
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)
    order_id    = serializers.IntegerField(source='order.id', read_only=True, allow_null=True)

    class Meta:
        model  = Inquiry
        fields = [
            'id', 'buyer', 'buyer_name', 'buyer_email',
            'order', 'order_id', 'subject', 'message',
            'reply', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'buyer_name', 'buyer_email', 'reply', 'status', 'created_at', 'updated_at']


class CreateInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Inquiry
        fields = ['order', 'subject', 'message']

    def create(self, validated_data):
        buyer = self.context['request'].user
        return Inquiry.objects.create(buyer=buyer, **validated_data)


class ReplyInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Inquiry
        fields = ['reply', 'status']