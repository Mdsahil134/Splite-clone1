from collections import defaultdict
from decimal import Decimal

from django.contrib.auth import get_user_model
from expenses.models import Expense
from groups.models import Group

from .models import Settlement

User = get_user_model()


def compute_group_balances(group):
    """Return per-user net balance in a group. Positive = owed money, negative = owes money."""
    balances = defaultdict(lambda: Decimal('0.00'))

    for expense in Expense.objects.filter(group=group):
        balances[expense.paid_by_id] += expense.amount
        for split in expense.splits.all():
            balances[split.user_id] -= split.amount

    for settlement in Settlement.objects.filter(group=group):
        balances[settlement.from_user_id] += settlement.amount
        balances[settlement.to_user_id] -= settlement.amount

    return dict(balances)


def simplify_debts(balances):
    """Greedy debt simplification: who owes whom."""
    creditors = []
    debtors = []

    for user_id, balance in balances.items():
        balance = balance.quantize(Decimal('0.01'))
        if balance > 0:
            creditors.append([user_id, balance])
        elif balance < 0:
            debtors.append([user_id, -balance])

    creditors.sort(key=lambda x: x[1], reverse=True)
    debtors.sort(key=lambda x: x[1], reverse=True)

    debts = []
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor_id, debt_amount = debtors[i]
        creditor_id, credit_amount = creditors[j]
        settled = min(debt_amount, credit_amount)
        if settled > 0:
            debts.append({
                'from_user_id': debtor_id,
                'to_user_id': creditor_id,
                'amount': settled,
            })
        debtors[i][1] -= settled
        creditors[j][1] -= settled
        if debtors[i][1] == 0:
            i += 1
        if creditors[j][1] == 0:
            j += 1

    return debts


def get_user_dashboard(user):
    """Summary across all groups for a user."""
    groups = Group.objects.filter(members=user)
    total_owed = Decimal('0.00')
    total_owing = Decimal('0.00')
    group_summaries = []

    for group in groups:
        balances = compute_group_balances(group)
        user_balance = balances.get(user.id, Decimal('0.00'))
        if user_balance > 0:
            total_owed += user_balance
        else:
            total_owing += abs(user_balance)

        debts = simplify_debts(balances)
        group_summaries.append({
            'group_id': group.id,
            'group_name': group.name,
            'your_balance': user_balance,
            'suggested_settlements': debts,
        })

    return {
        'total_owed_to_you': total_owed,
        'total_you_owe': total_owing,
        'net_balance': total_owed - total_owing,
        'groups': group_summaries,
    }
