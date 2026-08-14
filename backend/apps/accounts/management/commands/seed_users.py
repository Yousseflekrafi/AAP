from django.core.management.base import BaseCommand

from apps.accounts.models import Role, User
from apps.organizations.services import ensure_default_workspace

SEED_USERS = [
    {
        "email": "superadmin@aap.local",
        "password": "SuperAdmin123!",
        "first_name": "Super",
        "last_name": "Admin",
        "roles": [Role.SUPER_ADMIN],
    },
    {
        "email": "admin@aap.local",
        "password": "Admin123!",
        "first_name": "Admin",
        "last_name": "User",
        "roles": [Role.ADMIN],
    },
    {
        "email": "customer@aap.local",
        "password": "Customer123!",
        "first_name": "Customer",
        "last_name": "User",
        "roles": [],
    },
]


class Command(BaseCommand):
    help = "Seed a super_admin, admin, and customer user with known, pre-verified credentials for local development."

    def handle(self, *args, **options):
        role_objs = {}
        for role_name in (Role.SUPER_ADMIN, Role.ADMIN):
            role_objs[role_name], _ = Role.objects.get_or_create(name=role_name)

        for spec in SEED_USERS:
            user, created = User.objects.get_or_create(
                email=spec["email"],
                defaults={
                    "first_name": spec["first_name"],
                    "last_name": spec["last_name"],
                    "is_email_verified": True,
                },
            )
            user.set_password(spec["password"])
            user.first_name = spec["first_name"]
            user.last_name = spec["last_name"]
            user.is_email_verified = True
            user.is_active = True
            user.save()
            user.roles.set([role_objs[name] for name in spec["roles"]])
            ensure_default_workspace(user)

            verb = "Created" if created else "Updated"
            role_label = ", ".join(spec["roles"]) or "none (customer)"
            self.stdout.write(
                self.style.SUCCESS(
                    f"{verb}: {spec['email']} / {spec['password']}  (roles: {role_label})"
                )
            )

        self.stdout.write(self.style.WARNING("These are development credentials — never seed them in production."))
