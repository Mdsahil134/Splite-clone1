from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import serializers

from groups.models import Group
from users.serializers import UserSerializer

from .models import Settlement
from .services import compute_group_balances, simplify_debts

User = get_user_model()


class SettlementSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    from_user_id = serializers.IntegerField(write_only=True)
    to_user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Settlement
        fields = (
            'id', 'group', 'from_user', 'to_user',
            'from_user_id', 'to_user_id', 'amount', 'note', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        group_id = self.context.get('group_id')
        try:
            group = Group.objects.get(pk=group_id, members=self.context['request'].user)
        except Group.DoesNotExist:
            raise serializers.ValidationError({'group': 'Group not found or access denied.'})

        from_user_id = attrs.get('from_user_id')
        to_user_id = attrs.get('to_user_id')
        member_ids = set(group.members.values_list('id', flat=True))

        if from_user_id not in member_ids or to_user_id not in member_ids:
            raise serializers.ValidationError('Both users must be group members.')
        if from_user_id == to_user_id:
            raise serializers.ValidationError('Cannot settle with yourself.')
        if attrs.get('amount', Decimal('0')) <= 0:
            raise serializers.ValidationError({'amount': 'Amount must be positive.'})

        attrs['group'] = group
        return attrs

    def create(self, validated_data):
        from_user_id = validated_data.pop('from_user_id')
        to_user_id = validated_data.pop('to_user_id')
        return Settlement.objects.create(
            from_user_id=from_user_id,
            to_user_id=to_user_id,
            **validated_data,
        )


class BalanceSerializer(serializers.Serializer):
    def to_representation(self, group):
        balances = compute_group_balances(group)
        users = {u.id: u for u in group.members.all()}
        balance_list = []
        for user_id, amount in balances.items():
            user = users.get(user_id)
            if user and amount != 0:
                balance_list.append({
                    'user': UserSerializer(user).data,
                    'balance': amount,
                })
        debts = simplify_debts(balances)
        debt_list = []
        for debt in debts:
            debt_list.append({
                'from_user': UserSerializer(users[debt['from_user_id']]).data,
                'to_user': UserSerializer(users[debt['to_user_id']]).data,
                'amount': debt['amount'],
            })
        return {
            'group_id': group.id,
            'group_name': group.name,
            'balances': balance_list,
            'suggested_settlements': debt_list,
        }
