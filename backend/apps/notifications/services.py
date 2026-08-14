from .models import Notification


def notify(user, notif_type, title, body="", action_url=""):
    """Fire-and-forget: creates an in-app notification. Never raises on a
    bad recipient — callers shouldn't have a core action fail because a
    notification couldn't be written."""

    if user is None:
        return None
    return Notification.objects.create(
        recipient=user,
        notif_type=notif_type,
        title=title,
        body=body,
        action_url=action_url,
    )


def notify_many(users, notif_type, title, body="", action_url=""):
    Notification.objects.bulk_create(
        [
            Notification(recipient=user, notif_type=notif_type, title=title, body=body, action_url=action_url)
            for user in users
        ]
    )
