from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


# add additional models to this file to represent details about posts, likes, and followers