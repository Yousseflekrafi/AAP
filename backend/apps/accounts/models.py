import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_email_verified", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")
        return self._create_user(email, password, **extra_fields)


class Role(models.Model):
    """Coarse RBAC role: 'super_admin', 'admin', or a custom one. Fine-
    grained data permissions (table/column level) live in apps.permissions,
    not here."""

    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"

    # super_admin implies every capability admin has (platform-level admin
    # accounts/orgs/security on top of day-to-day user administration).
    IMPLIES = {
        SUPER_ADMIN: {SUPER_ADMIN, ADMIN},
        ADMIN: {ADMIN},
    }

    name = models.SlugField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class User(AbstractBaseUser, PermissionsMixin):
    class AccountType(models.TextChoices):
        PERSONAL = "personal", "Personal"
        COMPANY = "company", "Company"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    account_type = models.CharField(max_length=10, choices=AccountType.choices, default=AccountType.PERSONAL)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    auth_provider = models.CharField(
        max_length=20,
        choices=[("password", "Password"), ("google", "Google")],
        default="password",
    )

    roles = models.ManyToManyField(Role, blank=True, related_name="users")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def has_role(self, role_name):
        if self.is_superuser:
            return True
        held = set(self.roles.values_list("name", flat=True))
        for held_role in held:
            if role_name in Role.IMPLIES.get(held_role, {held_role}):
                return True
        return False

    @property
    def is_super_admin(self):
        return self.has_role(Role.SUPER_ADMIN)

    @property
    def is_admin(self):
        return self.has_role(Role.ADMIN)
