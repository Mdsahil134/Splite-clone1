from rest_framework import generics

from groups.models import Group

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return Expense.objects.filter(
            group_id=group_id,
            group__members=self.request.user,
        ).select_related('paid_by', 'group').prefetch_related('splits__user')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group_id'] = self.kwargs['group_id']
        return context

    def perform_create(self, serializer):
        serializer.save()


class ExpenseDetailView(generics.RetrieveAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(
            group__members=self.request.user,
        ).select_related('paid_by', 'group').prefetch_related('splits__user')
