
from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register, name='register'),

    path('post', views.post, name='post'),
    path('profile/<str:writer_username>', views.profile, name='profile'),
    path('following', views.following, name='following'),
    path('likes/<int:post_id>', views.likes, name='likes'),
    path('edit/<int:post_id>', views.edit, name='edit')
]
