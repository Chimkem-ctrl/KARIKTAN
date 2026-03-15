from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Inquiry
from .serializers import InquirySerializer, CreateInquirySerializer, ReplyInquirySerializer


def is_admin(request):
    return request.user.is_authenticated and request.user.role == 'admin'


class InquiryListCreateView(APIView):
    """
    GET  — buyer sees own; admin sees all
    POST — buyer creates inquiry
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        if is_admin(request):
            inquiries = Inquiry.objects.all().select_related('buyer', 'order')
        else:
            inquiries = Inquiry.objects.filter(buyer=request.user)
        return Response(InquirySerializer(inquiries, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        if is_admin(request):
            return Response({'error': 'Admins cannot submit inquiries.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CreateInquirySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            inquiry = serializer.save()
            return Response(InquirySerializer(inquiry).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InquiryDetailView(APIView):
    def get_object(self, pk, request):
        try:
            inquiry = Inquiry.objects.get(pk=pk)
            if is_admin(request) or inquiry.buyer == request.user:
                return inquiry
            return None
        except Inquiry.DoesNotExist:
            return None

    def get(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        inquiry = self.get_object(pk, request)
        if not inquiry:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InquirySerializer(inquiry).data)

    def patch(self, request, pk):
        try:
            inquiry = Inquiry.objects.get(pk=pk)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        """Admin can reply and close; buyer can only close their own"""
        if is_admin(request):
            serializer = ReplyInquirySerializer(inquiry, data=request.data, partial=True)
        elif request.user.is_authenticated and inquiry.buyer == request.user:
        # Buyer can only update status to 'closed'
            allowed = {'status': request.data.get('status')}
            if allowed['status'] != 'closed':
                return Response({'error': 'Buyers can only close inquiries.'}, status=status.HTTP_403_FORBIDDEN)
            serializer = ReplyInquirySerializer(inquiry, data=allowed, partial=True)
        else:
            return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        if serializer.is_valid():
            serializer.save()
            return Response(InquirySerializer(inquiry).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)