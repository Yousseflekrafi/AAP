from django.urls import path

from . import views

app_name = "admin_messages"

urlpatterns = [
    path("conversations/", views.ConversationListCreateView.as_view(), name="conversation-list"),
    path("conversations/<uuid:id>/", views.ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<uuid:id>/close/", views.ConversationCloseView.as_view(), name="conversation-close"),
    path("conversations/<uuid:id>/manage/", views.ConversationManageView.as_view(), name="conversation-manage"),
    path(
        "conversations/<uuid:conversation_id>/messages/",
        views.MessageListCreateView.as_view(),
        name="conversation-messages",
    ),
]
