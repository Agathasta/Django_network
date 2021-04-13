# NETWORK

## [CS50 Web Design Project 4](https://cs50.harvard.edu/web/2020/projects/4/network)

Design a Twitter-like social network website for making posts and following users.  

YouTube URL: <https://youtu.be/xxx>  

TECHNOLOGIES USED  

* HTML
* CSS
* JAVASCRIPT
* PYTHON
* DJANGO

1. MODELS  
I decided to use only 2 models, User and Post, related through a ForeignKey.  
Followers/following can be logged in a recursive ManyToMany relationship in User. Symmetry needs to be set to False and blank to True.  
The likes can be a ManyToMany relationship between User and Post, with blank set to True.  

2. CSS
I am not using Bootstrap (for now, I'll wait to get to Pagination).  
I have copied the normalize.css to normalize (duh) the starting css.  
Looking at OOCSS, SMACSS, ITCSS, ACSS and BEM. Ummm.  
Decide to use SCSS: <https://engineertodeveloper.com/how-to-easily-use-sass-scss-with-django/>  
