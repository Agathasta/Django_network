document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.btn-like').forEach(btn => likePost(btn))
 

  if (document.querySelector('#postform')) {
    document.querySelector('#postform').onsubmit = () => sendForm();
  }

  else if (document.querySelector('#profile-view') && writer != user) {
    document.querySelector('#btn-follow').onclick = () => followUser();
  }
})


function likePost(btn) {

  btn.addEventListener('click', () => {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const post_id = btn.dataset.value;

    fetch(`/likes/${post_id}`, {
      method: 'PATCH',
      headers: { 'X-CSRFToken': csrftoken }
    })
      .then(response => response.json())
      .then(data => {
        if(data.message) {
          document.querySelector('#message').innerHTML = data.message;
        }
        else {
          document.querySelector(`#likes-count-${post_id}`).innerHTML = data.likes;
          document.querySelector('#message').innerHTML = '';
        }
      })
      .catch(error => {
        console.log('Error: ', error);
      });
  })

}


function sendForm() {
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  // Get post content and put it into a FormData
  const post = document.querySelector('#id_post').value;
  const formData = new FormData();
  formData.append('post', post);

  // Send the FormData
  fetch('/post', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrftoken },
    body: formData
  })
    // Create and attach new post to post list
    .then(response => response.json())
    .then(data => {
      createPost(data);
      document.querySelector('#id_post').value = ' ';
    })
    .catch(error => {
      console.log('Error: ', error);
    });

  return false;
}

function createPost(data) {

  let fragment = document.createDocumentFragment();

  // Create username with link to profile
  const a = document.createElement('a');
  a.href = `/profile/${data.writer}`
  a.textContent = data.writer;
  a.className = 'post-writer';
  fragment.append(a)

  // Create the other post divs
  const classes = ['post-time', 'post-message', 'post-likes'];
  const contents = [data.timestamp, data.post, data.likes];

  for (let i = 0; i < contents.length; i++) {
    const div = document.createElement('div');
    div.textContent = contents[i];
    div.className = classes[i];
    fragment.append(div)
  }

  // Assemble post
  const newPost = document.createElement('article');
  newPost.className = 'post';
  newPost.append(fragment);

  // Prepend post to the list and add icons etc
  document.querySelector('#postlist').prepend(newPost);

  const icon = document.createElement('span');
  icon.classList.add('far', 'fa-heart');
  document.querySelector('.post-likes').prepend(icon);
}


function followUser() {
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  fetch(`/profile/${writer}`, {
    method: 'PATCH',
    headers: { 'X-CSRFToken': csrftoken }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      document.querySelector('#followers').innerHTML = data.followers.length;

      if (data.message == 'unfollow') {
        document.querySelector('#btn-follow').innerHTML = 'Unfollow';
      }
      else {
        document.querySelector('#btn-follow').innerHTML = 'Follow';
      }
    })
}