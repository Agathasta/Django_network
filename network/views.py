from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

import json

from .models import User, Post
from .forms import PostForm

def index(request):
    # Display all posts
    posts = Post.objects.order_by('-timestamp').all()
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/index.html", {
        'form': PostForm(),
        'page_obj': page_obj,
        'post_list_type': "all"
    })


def post(request):
    # Create a new post
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            newPost = Post()
            newPost.post = form.cleaned_data['post']
            newPost.writer = request.user
            newPost.save()
            return JsonResponse(newPost.serialize(), safe=False)
        else:
            return JsonResponse({"error": form.errors}, status=400)
    else:
        # Create post must be via POST
        return JsonResponse({"error": "POST request required."}, status=400)


def profile(request, writer_username):
    # Query for requested writer
    try:
        writer = User.objects.get(username=writer_username)
    except User.DoesNotExist:
        return JsonResponse({"error": "Writer not found."}, status=404)
    
    # Display profile posts
    if request.method == "GET":
        
        # Change text in Follow button
        if writer.follower.filter(pk=request.user.pk).exists():
            follow_btn = 'unfollow'
        else:
            follow_btn = 'follow'

        # Get all posts by the writer
        posts = writer.posts.order_by('-timestamp').all()

        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)

        return render(request, "network/index.html", {
            'user': request.user,
            'writer': writer,
            'page_obj': page_obj,
            'follow_btn': follow_btn,
            'post_list_type': "profile"
        })

    elif request.method == "PATCH":
        if writer.follower.filter(pk=request.user.pk).exists():
            writer.follower.remove(request.user)
            message = 'follow'
        else:
            writer.follower.add(request.user)
            message = 'unfollow' 

        # To be able to send them as JSON. It turns out it is  quite unnecesary, since I only need 
        # the total of followers in the DOM, not their names.
        followers = list(writer.follower.values())
        return JsonResponse({'followers': followers, 'message': message}, safe=False)

    # Profile must be via GET or PATCH
    else:
        return JsonResponse({"error": "GET or PATCH request required."}, status=400)


@login_required(login_url='/login')
def following(request):

    user = request.user
    following = user.following.all()
    posts = Post.objects.filter(writer__in=following).order_by('-timestamp')

    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/index.html", {
        'page_obj': page_obj,
        'following': following,
        'post_list_type': "following",
    })


def likes(request, post_id):

    if request.user.is_authenticated:
        if request.method == 'PATCH':
            post = Post.objects.get(id=post_id)

            if post.writer != request.user:

                if post.liked_by.filter(pk=request.user.pk).exists():
                    post.liked_by.remove(request.user)
                else:
                    post.liked_by.add(request.user)
                
                return JsonResponse(post.serialize())

            else:
                return JsonResponse({'message': 'You cannot like your own post'})
            
        else:
            return JsonResponse({"error": "PATCH request required."}, status=400)
    else:
        return JsonResponse({'message': 'Log-in'})


def edit(request, post_id):

    if request.method == 'PATCH':
        post = Post.objects.get(id=post_id)
        data = json.loads(request.body)

        if post.writer == request.user:
            post.post = data['post']
            post.save()
            return HttpResponse(status=204)

        else:
            return JsonResponse({'message': 'You can only edit your own posts'})
        
    else:
        return JsonResponse({"error": "PATCH request required."}, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
