const showComments = document.getElementById("showComments");
const comments = document.getElementById("comments");
const submitComment = document.getElementById("submitComment");

showComments.addEventListener("click",()=>{
    comments.classList.toggle("hidden");
});

submitComment.addEventListener("click",()=>{
    const commentText = document.getElementById("commentInput").nodeValue;
    const user = "Tinotenda Maisiri"
    const articleID = document.getElementById("articleID").nodeValue

    fetch("/comment",{
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
    })
})