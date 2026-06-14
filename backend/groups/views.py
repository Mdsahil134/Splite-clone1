from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Group
from .serializers import AddMemberSerializer, GroupSerializer

User = get_user_model()


class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        return Group.objects.filter(members=self.request.user).prefetch_related('members', 'created_by')


class GroupDetailView(generics.RetrieveAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        return Group.objects.filter(members=self.request.user).prefetch_related('members', 'created_by')


class AddMemberView(APIView):
    def post(self, request, pk):
        try:
            group = Group.objects.get(pk=pk, members=request.user)
        except Group.DoesNotExist:
            return Response({'detail': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.get(id=serializer.validated_data['user_id'])
        group.members.add(user)
        return Response(GroupSerializer(group, context={'request': request}).data)
