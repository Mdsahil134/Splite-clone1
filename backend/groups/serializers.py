from django.contrib.auth import get_user_model
from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Group

User = get_user_model()


class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Group
        fields = (
            'id', 'name', 'description', 'created_by',
            'members', 'member_ids', 'created_at',
        )
        read_only_fields = ('id', 'created_by', 'created_at')

    def create(self, validated_data):
        member_ids = validated_data.pop('member_ids', [])
        user = self.context['request'].user
        group = Group.objects.create(created_by=user, **validated_data)
        group.members.add(user, *member_ids)
        return group


class AddMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError('User not found.')
        return value
