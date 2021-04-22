document.addEventListener("DOMContentLoaded", () => {
  // Set a function for the like button on every post
  document.querySelectorAll(".btn-like").forEach((btn) => {
    btn.onclick = () => likePost(btn);
  });
  // Set a function for the edit button on the user's posts
  if (document.querySelector(".post-edit")) {
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () => editPost(btn);
    });
  }
  // Set a function to submit a new post
  if (document.querySelector("#postform")) {
    document.querySelector("#postform").onsubmit = () => submitForm();
  }
  // Set a function for the follow button on posts not by user
  if (document.querySelector("#btn-follow")) {
    document.querySelector("#btn-follow").onclick = () => followWriter();
  }
});

function submitForm() {
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;

  // Get post content and put it into a FormData
  const post = document.querySelector("#id_post").value;
  const formData = new FormData();
  formData.append("post", post);

  // Send the FormData
  fetch("/post", {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
    body: formData,
  })
    // Create and attach new post to post list
    .then((response) => response.json())
    .then((data) => {
      createPost(data);
      document.querySelector("#id_post").value = "";
      document.querySelector("#id_post").blur();
    })
    .catch((error) => {
      console.log("Error: ", error);
    });

  return false;
}

function createPost(data) {
  let fragment = document.createDocumentFragment();

  // Create username with avatar and link to profile
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.setAttribute('style', `background-color: ${data.color}`)
  avatar.innerHTML = data.writer[0].toUpperCase();

  const username = document.createElement("a");
  username.href = `/profile/${data.writer}`;
  username.textContent = data.writer;
  username.className = "post-writer";

  let writer = document.createElement("div");
  writer.className = 'post-writer';
  writer.append(avatar);
  writer.append(username);
  fragment.append(writer);

  // Create post time and post message
  const classes = ["post-time", "post-message"];
  const contents = [data.timestamp, data.post];

  for (let i = 0; i < contents.length; i++) {
    const div = document.createElement("div");
    div.textContent = contents[i];
    div.className = classes[i];
    fragment.append(div);
  }

  // Create likes
  const heart = document.createElement("i");
  heart.classList.add('far', 'fa-heart', 'btn-like');

  const count = document.createElement("span");
  count.textContent = data.likes;
  count.className = "post-likes";
  
  let likes = document.createElement("div");
  likes.className = "post-likes";
  likes.append(heart);
  likes.append(count);
  fragment.append(likes);

  // Create edit button
  const editBtn = document.createElement("button");
  editBtn.className = "btn-edit"
  editBtn.setAttribute('data-value', `${data.id}`)
  editBtn.innerHTML = "Edit";
  let edit = document.createElement("div");
  edit.className = 'post-edit';
  edit.append(editBtn);
  fragment.append(edit);
  console.log(data.id);

  // Assemble post
  const newPost = document.createElement("article");
  newPost.className = "post";
  newPost.append(fragment);

  // Prepend post to the list and add icons etc
  document.querySelector("#postlist").prepend(newPost);

  const icon = document.createElement("span");
  icon.classList.add("far", "fa-heart");
  document.querySelector(".btn-like").prepend(icon);
}

function followWriter() {
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;

  // Send the writer's name to find their followers
  fetch(`/profile/${writer}`, {
    method: "PATCH",
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => response.json())
    .then((data) => {
      // Count the followers and update the corresponding counter
      document.querySelector("#followers").innerHTML = data.followers.length;

      // Change the text in the follow button
      if (data.message == "unfollow") {
        document.querySelector("#btn-follow").innerHTML = "Unfollow";
      } else {
        document.querySelector("#btn-follow").innerHTML = "Follow";
      }
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

function likePost(btn) {
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const post_id = btn.dataset.value;

  fetch(`/likes/${post_id}`, {
    method: "PATCH",
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => response.json())
    .then((data) => {
      // Display error message if any for 1.5s
      if (data.message) {
        document.querySelector(`#message-${post_id}`).innerHTML = data.message;
        setTimeout(() => {
          document.querySelector(`#message-${post_id}`).innerHTML = "";
        }, 1500);
      }
      // Update like count
      else {
        document.querySelector(`#likes-count-${post_id}`).innerHTML =
          data.likes;

        // Change heart depending on current user having liked it
        if (data.liked_by.includes(user)) {
          document.querySelector(`#heart-${post_id}`).classList.add("fas");
          document.querySelector(`#heart-${post_id}`).classList.remove("far");
        } else {
          document.querySelector(`#heart-${post_id}`).classList.add("far");
          document.querySelector(`#heart-${post_id}`).classList.remove("fas");
        }
      }
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
}

function editPost(btn) {
  const post_id = btn.dataset.value;
  let post = document.querySelector(`#post-message-${post_id}`);
  let textarea = document.createElement("textarea");
  textarea.value = post.innerHTML;
  textarea.className = 'editable'

  // Replace post with textarea and focus on it to write
  post.replaceWith(textarea);
  textarea.focus();

  // Unfocus if Enter is pressed
  textarea.onkeydown = function (e) {
    if (e.key == "Enter") {
      textarea.blur();
    }
  };
  // When unfocused: update post and replace textarea with post
  textarea.onblur = () => {
    post.innerHTML = textarea.value;
    textarea.replaceWith(post);

    // Update db
    const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]").value;

    fetch(`/edit/${post_id}`, {
      method: "PATCH",
      headers: { "X-CSRFToken": csrftoken },
      body: JSON.stringify({
        post: post.innerHTML,
      }),
    });
  };
}
