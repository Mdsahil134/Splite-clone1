from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from groups.models import Group

from .models import Settlement
from .serializers import BalanceSerializer, SettlementSerializer
from .services import get_user_dashboard


class GroupBalanceView(APIView):
    def get(self, request, group_id):
        try:
            group = Group.objects.prefetch_related('members').get(
                pk=group_id, members=request.user,
            )
        except Group.DoesNotExist:
            return Response({'detail': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(BalanceSerializer().to_representation(group))


class DashboardView(APIView):
    def get(self, request):
        return Response(get_user_dashboard(request.user))


class SettlementListCreateView(generics.ListCreateAPIView):
    serializer_class = SettlementSerializer

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return Settlement.objects.filter(
            group_id=group_id,
            group__members=self.request.user,
        ).select_related('from_user', 'to_user', 'group')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group_id'] = self.kwargs['group_id']
        return context
