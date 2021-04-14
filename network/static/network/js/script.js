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
    // Update the post list
    .then(response => response.json())
    .then(data => {
      const newPost = document.createElement('li');
      newPost.innerHTML = `
        Post: ${data.post}
        User: ${data.user}
        Timestamp: ${data.timestamp}
        Likes: ${data.liked_count}`;
      document.querySelector('#postlist').prepend(newPost);
      document.querySelector('#id_post').value = ' ';
    })
    .catch(error => {
      console.log('Error: ', error);
    });

  return false;
}
