const data = document.getElementById("data").value
const jsonData = JSON.parse(data)
const editor = new EditorJS({
    holder: 'editorjs',

    tools: {  
        header: {
            class: Header,
            config: {
                placeholder: 'Enter a header',
                levels: [2, 3, 4],
                defaultLevel: 3
            }
        },
        list: {
            class: List,
            inlineToolbar: true,
            config: {
                defaultStyle: 'unordered'
            }
        }
    },
    data: jsonData,
});

document.getElementById("save").addEventListener("click",()=>{

    const articleId = document.getElementById("articleId").value;

    editor.save().then((articleData)=>{
        fetch("/updatepost", {
            method: "POST",
            body: JSON.stringify({
                articleContent : articleData,
                articleId: articleId

            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then((response)=>response.json())
        .then((res)=>{
            if (res.isProfane){
                alert("This document contains profane words please remove them ")
            }else{
                window.location.href = "/journals"
            }
            
        })
        
    }).catch((err)=>{
        console.log(err)
    })
})
