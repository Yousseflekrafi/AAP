from rest_framework.permissions import BasePermission

from apps.accounts.models import Role


class IsConversationParticipant(BasePermission):
    """super_admin sees/acts on everything; everyone else only on
    conversations they started or that were directed at them."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.SUPER_ADMIN):
            return True
        return obj.created_by_id == user.id or obj.target_user_id == user.id
