from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='follower')

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "following": [self.username for self in self.following.all()],
            "followers": [self.follower.username for self.follower in self.follower.all()]
        }

class Post(models.Model):
    post = models.CharField(max_length=140)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    liked_by = models.ManyToManyField(User, blank=True, related_name='liked_posts')

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "user": self.user.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "liked_by": [user.username for user in self.liked_by.all()],
        }