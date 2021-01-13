document.addEventListener("DOMContentLoaded", function(){
    var form = document.getElementById("pageUp");
    form.addEventListener("submit", function(e){
        e.preventDefault();
        console.log("Sending Formular")
        async function register(){
            
            var text_content = document.getElementById("textarea");
            console.log(text_content);
            loadUsers();
        }
        register();
    });

    var title = new Array();
    var text = new Array();
    var startDate;
    var endDate;

    document.getElementById("pageUp").onclick = function(){
        if(maxPages > currentPage+1) {
            save();
            currentPage++;
            loadWorkspace();
        }
        else if(maxPages = currentPage+1) {
            save();
            window.location = "/main";
        }
    }
    document.getElementById("pageDown").onclick = function(){
        if(currentPage > 0){
            
            save();
            currentPage--;
            loadWorkspace();
        }
    }

    async function save(){
        switch(currentPage)
        {
            case 0:
                title = document.getElementById("title").value;
                text = document.getElementById("textarea").value;
                //text.replace("\n", "<br />");
                break;
            case 1:
                startDate = document.getElementById("startDate").value;
                endDate = document.getElementById("endDate").value;
                break;
            case 2:
                var bodyContent = {title:title, text:text, startDate:startDate, endDate:endDate};
                console.log(bodyContent);
                var response = await fetch("/newpost", {
                method: "POST",
                headers: {
                    "Accept":"application/json",
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(bodyContent)
                });
                var data = await response.json();
                console.log(data);
                break;
        }
    };

    /*Show Elements*/
    var maxPages = 3;
    var currentPage = 0;

    async function loadWorkspace(){
        switch(currentPage)
        {
            case 0:
                loadContentEditor();
                break;
            case 1:
                loadTimescaleEditor();
                break;
            case 2:
                loadPreviewEditor();
                break;
        }    
    };
    loadWorkspace();

    function loadContentEditor(){
        document.getElementById("workspace").innerHTML = "";        //empty table
        var container = document.getElementById("workspace");       //insert in workspace
        var content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = `
        <form id="editForm">
            <textarea id="title" name="title" rows="1" cols="15" maxlength="30" placeholder="Title">${title}</textarea>
            <textarea id="textarea" name="textarea" rows="30" cols="100" maxlength="1000" placeholder="Text">${text}</textarea>
        </form>
        `
        container.appendChild(content)
    }
    function loadTimescaleEditor(){
        const d = new Date();
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        var today = `${ye}-${mo}-${da}`;

        document.getElementById("workspace").innerHTML = "";        //empty table
        var container = document.getElementById("workspace");       //insert in workspace
        var content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = `
        <form id="editForm2">

        <label for="start">Start date:</label>
        <input type="date" id="startDate" name="post-start" value=${today} min=${today}>
        <label for="start">End date:</label>
        <input type="date" id="endDate" name="post-end" value=${today} min=${today}>
        </form>
        `
        container.appendChild(content)
    }
    function loadPreviewEditor(){
        document.getElementById("workspace").innerHTML = "";        //empty table
        var container = document.getElementById("workspace");       //insert in workspace
        var content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = `
        <div class="datePreview">${startDate}  bis  ${endDate}</div>
        <div id="postPreview">
        <h1>${title}</h1>
        <pre>${text}</pre>
        <div>
        `
        container.appendChild(content)
    }
});
