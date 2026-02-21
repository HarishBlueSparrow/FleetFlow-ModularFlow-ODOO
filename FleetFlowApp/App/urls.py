from django.urls import path
from .views import *

urlpatterns = [
    path("reg/", reg_view, name="register-v"),
    path("", index_view, name="register-v"),
    path("login/", login_view, name="login-v"),
    path("forgot-password/", ForgotPassword),
    path("reset-link-sent/<str:reset_id>", reset_link_sent),
    path("reset-password/<str:reset_id>", password_reset, name="reset-password"),
]
