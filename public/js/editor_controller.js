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
});

document.getElementById("submit").addEventListener("click",()=>{
    const journalName = document.getElementById("journalName").value;
    const articleName = document.getElementById("articleName").value;
    editor.save().then((articleData)=>{
        fetch("/savepost", {
            method: "POST",
            body: JSON.stringify({
                articleContent : articleData,
                articleName : articleName,
                journalName : journalName

            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then((response)=>response.json())
        .then((res)=>{
            if (res.isProfane){
                alert("There are profane words in this document please remove them")
            }else{
                if (res.id){
                    document.getElementById("submit").style.display ="none"
                    document.getElementById("addImageButton").disabled = false;
                    document.getElementById("imageId").value = res.id;
                }
            }
        })
        
    }).catch((err)=>{
        console.log(err)
    })
})
