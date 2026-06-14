from django.urls import path

from .views import DashboardView, GroupBalanceView, SettlementListCreateView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('group/<int:group_id>/balances/', GroupBalanceView.as_view(), name='group-balances'),
    path('group/<int:group_id>/', SettlementListCreateView.as_view(), name='settlement-list-create'),
]
