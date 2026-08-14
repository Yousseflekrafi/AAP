from rest_framework.permissions import BasePermission

from apps.accounts.models import Role


class IsConversationParticipant(BasePermission):
    """super_admin sees/acts on everything; a plain admin only on
    conversations they created."""

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.has_role(Role.SUPER_ADMIN):
            return True
        return obj.created_by_id == user.id
