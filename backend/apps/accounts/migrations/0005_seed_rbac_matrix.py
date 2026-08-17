from django.db import migrations

# The permission matrix. Each role's set is cumulative (super_admin holds
# everything admin holds, admin holds everything customer holds) so
# resolution is a flat union over a user's held roles — no runtime
# hierarchy walk needed.
PERMISSIONS = {
    "profile.view": "View own profile/settings",
    "projects.view": "View projects in own organization",
    "members.view": "View the organization members list",
    "members.manage": "Add/remove organization members",
    "org.edit": "Edit organization profile",
    "messages.view": "View messages/notifications",
    "admin.console.view": "Access the admin console",
    "organizations.view_all": "View all organizations across the platform",
    "organizations.suspend": "Suspend/reactivate an organization",
    "users.view_all": "View all users across organizations",
    "users.manage": "Activate/deactivate/delete/change roles on any user",
    "audit.view": "View the audit log and security events",
    "applications.manage": "Manage applications across organizations",
}

CUSTOMER_PERMS = {"profile.view", "projects.view", "members.view", "messages.view"}
ADMIN_PERMS = CUSTOMER_PERMS | {"members.manage", "org.edit", "admin.console.view"}
SUPER_ADMIN_PERMS = ADMIN_PERMS | {
    "organizations.view_all",
    "organizations.suspend",
    "users.view_all",
    "users.manage",
    "audit.view",
    "applications.manage",
}

ROLES = {
    "customer": CUSTOMER_PERMS,
    "admin": ADMIN_PERMS,
    "super_admin": SUPER_ADMIN_PERMS,
}


def seed_rbac(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    Permission = apps.get_model("accounts", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")
    User = apps.get_model("accounts", "User")

    import uuid

    permission_objs = {}
    for key, description in PERMISSIONS.items():
        perm, _ = Permission.objects.get_or_create(key=key, defaults={"id": uuid.uuid4(), "description": description})
        permission_objs[key] = perm

    role_objs = {}
    for name in ROLES:
        role, _ = Role.objects.get_or_create(name=name)
        role_objs[name] = role

    for role_name, perm_keys in ROLES.items():
        role = role_objs[role_name]
        for key in perm_keys:
            RolePermission.objects.get_or_create(
                role=role, permission=permission_objs[key], defaults={"id": uuid.uuid4()}
            )

    # Every existing user gets the baseline customer role (previously
    # implicit) alongside whatever admin/super_admin roles they already hold.
    customer_role = role_objs["customer"]
    for user in User.objects.all():
        user.roles.add(customer_role)


def unseed_rbac(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    Permission = apps.get_model("accounts", "Permission")
    Role.objects.filter(name__in=ROLES.keys()).delete()
    Permission.objects.filter(key__in=PERMISSIONS.keys()).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0004_permission_rolepermission_role_permissions_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_rbac, unseed_rbac),
    ]
