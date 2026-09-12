from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

    def ready(self):
        from django.db.models.signals import post_delete, post_save

        from .rbac import invalidate_role_permission_cache

        RolePermission = self.get_model("RolePermission")
        Role = self.get_model("Role")
        Permission = self.get_model("Permission")

        for model in (RolePermission, Role, Permission):
            post_save.connect(invalidate_role_permission_cache, sender=model)
            post_delete.connect(invalidate_role_permission_cache, sender=model)
