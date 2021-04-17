document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#all-view')) {
    document.querySelector('#postform').onsubmit = () => sendForm();
  }
  else if (document.querySelector('#profile-view') && writer != user) {
    document.querySelector('#btn-follow').onclick = () => followUser();
  }
})

function followUser() {
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  fetch(`/profile/${writer}`, {
    method: 'PATCH',
    headers: { 'X-CSRFToken': csrftoken }
  })
    .then(response => response.json())
    .then(data => {

      document.querySelector('#followers').innerHTML = data.followers.length;

      if (data.message == 'unfollow') {
        document.querySelector('#btn-follow').innerHTML = 'Unfollow';
      }
      else {
        document.querySelector('#btn-follow').innerHTML = 'Follow';
      }
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
