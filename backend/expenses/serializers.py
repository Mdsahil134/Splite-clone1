from decimal import Decimal, ROUND_HALF_UP

from django.contrib.auth import get_user_model
from rest_framework import serializers

from groups.models import Group
from users.serializers import UserSerializer

from .models import Expense, ExpenseSplit

User = get_user_model()


class ExpenseSplitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ExpenseSplit
        fields = ('id', 'user', 'amount')


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = UserSerializer(read_only=True)
    splits = ExpenseSplitSerializer(many=True, read_only=True)
    paid_by_id = serializers.IntegerField(write_only=True)
    split_among_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Expense
        fields = (
            'id', 'group', 'description', 'amount', 'paid_by', 'paid_by_id',
            'splits', 'split_among_ids', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        group_id = self.context.get('group_id')
        try:
            group = Group.objects.get(pk=group_id, members=self.context['request'].user)
        except Group.DoesNotExist:
            raise serializers.ValidationError({'group': 'Group not found or access denied.'})

        paid_by_id = attrs.get('paid_by_id')
        if not group.members.filter(id=paid_by_id).exists():
            raise serializers.ValidationError({'paid_by_id': 'Payer must be a group member.'})

        split_among_ids = attrs.get('split_among_ids') or list(
            group.members.values_list('id', flat=True)
        )
        member_ids = set(group.members.values_list('id', flat=True))
        invalid = set(split_among_ids) - member_ids
        if invalid:
            raise serializers.ValidationError({'split_among_ids': 'All users must be group members.'})
        if not split_among_ids:
            raise serializers.ValidationError({'split_among_ids': 'At least one member required.'})

        attrs['group'] = group
        attrs['split_among_ids'] = split_among_ids
        return attrs

    def create(self, validated_data):
        split_among_ids = validated_data.pop('split_among_ids')
        paid_by_id = validated_data.pop('paid_by_id')
        amount = validated_data['amount']
        count = len(split_among_ids)
        share = (amount / count).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        remainder = amount - (share * count)

        expense = Expense.objects.create(paid_by_id=paid_by_id, **validated_data)

        splits = []
        for i, user_id in enumerate(split_among_ids):
            split_amount = share
            if i == 0:
                split_amount += remainder
            splits.append(ExpenseSplit(expense=expense, user_id=user_id, amount=split_amount))
        ExpenseSplit.objects.bulk_create(splits)
        return expense
