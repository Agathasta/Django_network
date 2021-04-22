from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    color = models.CharField(max_length=7, default='#000000')
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='follower')

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "following": [self.username for self in self.following.all()],
            "followers": [self.follower.username for self.follower in self.follower.all()],
        }


class Post(models.Model):
    writer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    post = models.CharField(max_length=140)
    timestamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, blank=True, related_name='posts_liked')

    def serialize(self):
        return {
            "id": self.id,
            "post": self.post,
            "writer": self.writer.username,
            "color": self.writer.color,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.liked_by.count(),
            "liked_by": [self.username for self in self.liked_by.all()]
        }

    def __str__(self):
        return f"{self.post} | {self.writer}"

