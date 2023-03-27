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
        }).then(res => {
            if (res.redirected) {
                window.location.href = res.url;
            }
        })
    }).catch((err)=>{
        console.log(err)
    })
})
