const showComments = document.getElementById("showComments");
const comments = document.getElementById("comments");
const submitComment = document.getElementById("submitComment");
const commentsContainer = document.getElementById("commentContainer");

showComments.addEventListener("click",()=>{
    comments.classList.toggle("hidden");
    loadComments();
});

submitComment.addEventListener("click",()=>{
    const commentText = document.getElementById("commentInput").value;
    const user = "Tinotenda Maisiri"
    const articleID = document.getElementById("articleID").value;

    fetch("/comments",{
        method: "POST",
        body: JSON.stringify({
            comment: commentText,
            user: user,
            articleID: articleID
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((response)=>{
        console.log(response);
        loadComments();
    })
})

function loadComments(){
    fetch(`/comments/${articleID.value}` ,{
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((response)=>(response.json()))
    .then((articles)=>{
        while (commentsContainer.firstChild) {
            commentsContainer.removeChild(commentsContainer.firstChild);
          }
        articles.forEach((article=>{
            const commentContainer = document.createElement("div");
            commentContainer.classList.add("comment");
            const name = document.createElement("p");
            const nameText = document.createTextNode(article.user)
            name.appendChild(nameText);
            name.classList.add("user");
            const comment = document.createElement("p");
            const commentText = document.createTextNode(article.comment);
            comment.appendChild(commentText);
            commentContainer.appendChild(name);
            commentContainer.appendChild(comment)

            
            commentsContainer.appendChild(commentContainer)

            // commentContainer.appendChild("<p class='date'>28/03/2022</p>")
        }))
        document.getElementById("commentInput").value = "";
    })
}
