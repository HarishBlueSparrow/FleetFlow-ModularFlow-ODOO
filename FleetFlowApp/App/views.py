from django.shortcuts import render, redirect
from django.urls import reverse
from django.core.mail import EmailMessage
from django.contrib.auth import get_user_model, authenticate, login
from .models import *
from django.conf import settings
from .helper import *


User = get_user_model()

def index_view(r):
    try:
        profile = Profile.objects.get(user = r.user)
    except Profile.DoesNotExist:
        return redirect("/login")
    
    
    return render(r, "index.html", {"prof":profile})

# Create your views here.
def reg_view(r):
    
    if r.method == "POST":
        username = r.POST.get("username")
        email = r.POST.get("email")
        password = r.POST.get("password")
        cpassword = r.POST.get("confirm_password")

        if not User.objects.filter(username=username).exists() and not User.objects.filter(email=email).exists() and password == cpassword:
            new_user = User.objects.create_user(username=username, email=email, password=password)
            new_user.save()

            profile_for_new_user = Profile.objects.create(user=new_user)
            profile_for_new_user.role = "User"
            profile_for_new_user.save()

            return redirect("/login")

    return render(r, "reg.html")

def login_view(r):

    if r.method == "POST":
        username = r.POST.get("username")
        email = r.POST.get("email")
        password = r.POST.get("password")
        cpassword = r.POST.get("confirm_password")

        user = authenticate(r, username = username, password = password)

        if user != None:
            login(r, user=user)    
            return redirect("/")
    return render(r, "login.html")

def ForgotPassword(r):

    if r.method == "POST":
        email = r.POST.get("email")

        try:
            user = User.objects.get(email=email)

            new_pass_reset = PasswordReset.objects.create(user=user)
            new_pass_reset.save()

            password_reset_url = reverse("reset-password", kwargs={"reset_id": new_pass_reset.reset_id})
            full_password_reset_url = f"{r.scheme}://{r.get_host()}{password_reset_url}"


            email_body = f"""
you can reset your password to your join the realm account using the link below.......
|           ___________
|         /            \
|        /              \   
|       |    |     |     |
|       |                |
|       |   \_______/    |
|        \              /
|         \------------/
|           
v
{full_password_reset_url}
"""
            email_message = EmailMessage(
                "reset your password",
                email_body,
                settings.EMAIL_HOST_USER,
                [email]
            )
            
            email_message.fail_silently = True
            email_message.send()
            return redirect(f"/reset-link-sent/{new_pass_reset.reset_id}")

        except User.DoesNotExist:
            return redirect("/")

    return render(r, "forget_password.html")

def reset_link_sent(r, reset_id):
    return render(r, "password_reset_sent.html")

def password_reset(r, reset_id):

    try:
        password_reset = PasswordReset.objects.get(reset_id=reset_id)
        user = password_reset.user

        if r.method == "POST":
            password = r.POST.get("password")
            cpassword = r.POST.get("confirm_password")

            if password == cpassword:
                user.set_password(password)
                user.save()
                password_reset.delete()
                return redirect("/login")
            
            return redirect("/")
        

    except PasswordReset.DoesNotExist:
        return redirect("/")

    return render(r, "password_reset.html")