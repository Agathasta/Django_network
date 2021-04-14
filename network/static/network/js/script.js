document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('#postform').onsubmit = () => sendForm();

})


function sendForm() {

  // Get post content and put it into a FormData
  const post = document.querySelector('#id_post').value;
  const formData = new FormData();
  formData.append('post', post);

  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  // Send the FormData
  fetch('', {
    method: 'POST',
    headers: { 'X-CSRFToken': csrftoken },
    mode: 'same-origin',
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
  // Create new post
  const classes = ['post-user', 'post-time', 'post-message', 'post-likes'];
  const contents = [data.user, data.timestamp, data.post, data.liked_count];

  let fragment = document.createDocumentFragment();

  for (let i = 0; i < contents.length; i++) {
    const div = document.createElement('div');
    div.textContent = contents[i];
    div.className = classes[i];
    fragment.append(div)
  }

  const newPost = document.createElement('article');
  newPost.className = 'post';
  newPost.append(fragment);

  // Prepend post to the list and add icons etc
  document.querySelector('#postlist').prepend(newPost);

  const icon = document.createElement('span');
  icon.classList.add('far', 'fa-heart');
  document.querySelector('.post-likes').prepend(icon);


}