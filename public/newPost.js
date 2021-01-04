document.addEventListener("DOMContentLoaded", function(){
    var form = document.getElementById("pageUp");
    form.addEventListener("submit", function(e){
        e.preventDefault();
        console.log("Sending Formular")
        async function register(){
            var text = document.getElementById("textarea").value;
            console.log(text);
            loadUsers();
        }
        register();
    });

    /*changin page*/
    var pageUp = document.getElementById("pageUp");
    var pageDown = document.getElementById("pageDown");
    var text = "";

    pageUp.addEventListener("click", () => {
        if(maxPages > currentPage+1) {
            currentPage++;
            loadWorkspace();
        }
        
    });

    pageDown.addEventListener("click", () => {
        if(currentPage > 0){
            currentPage--;
            loadWorkspace();
        }
        
    });

    /*Show Elements*/
    var maxPages = 3;
    var currentPage = 0;

    async function loadWorkspace(){
        switch(currentPage)
        {
            case 0:
                loadContentEditor()
                break;
            case 1:
                loadTimescaleEditor()
                break;
            case 2:
                loadPreviewEditor()
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
            <textarea id="textarea" name="textarea" rows="10" cols=56% style="resize: none;">${text}</textarea>
        </form>
        `
        container.appendChild(content)
    }
    function loadTimescaleEditor(){
        document.getElementById("workspace").innerHTML = "";        //empty table
        var container = document.getElementById("workspace");       //insert in workspace
        var content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = `
        <h1>2</h1>
        `
        container.appendChild(content)
    }
    function loadPreviewEditor(){
        document.getElementById("workspace").innerHTML = "";        //empty table
        var container = document.getElementById("workspace");       //insert in workspace
        var content = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = `
        <h1>3</h1>
        `
        container.appendChild(content)
    }

    /*
    function showUsers(pdata){
            row.classList.add("row");
            row.innerHTML = `
                <div class="col-left">
                    <h2>${element.username}</h2>
                </div>
                <div class="col-right">
                    <button class="${status} susButton" data-username="${element.username}">
                    <i class="${susbuttonstate} , icon"></i>
                    </button>
                    <button class="remButton" data-username="${element.username}">
                        <i class="icon-trash , icon"></i>
                    </button>
                </div>
            `
            container.appendChild(row)
        });
    }
   */
});
