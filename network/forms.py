from django import forms
from .models import Post


class PostForm(forms.ModelForm):
  class Meta:
    model = Post
    fields = ['post']
    widgets = {
      'post': forms.TextInput(attrs={'placeholder': 'What\'s going on?'}),
    }