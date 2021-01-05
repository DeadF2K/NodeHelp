document.addEventListener("DOMContentLoaded", function(){    
    /*changin page*/
    var pageUp = document.getElementById("pageUp");
    var pageDown = document.getElementById("pageDown");

    pageUp.addEventListener("click", () => {
        if(maxPages > currentPage+1) {
            currentPage++;
            loadPosts();
        }
    });

    pageDown.addEventListener("click", () => {
        if(currentPage > 0){
            currentPage--;
            
            loadPosts();
        }
    });

    /*logout*/
    var lgoBtn = document.getElementById("lgoBtn");
    lgoBtn.addEventListener("click", () => {
        window.location = "/logout";
    });

    /*NewPost*/
    var addBtn = document.getElementById("addBtn");
    addBtn.addEventListener("click", () => {
        window.location = "/newPost";
    });

    /*Show Elements*/
    var maxPages;
    var currentPage = 0;
    var maxDisplayed = 8;
    async function loadPosts(){
        var response = await fetch("/getposts", {
            method: "GET",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            }
        })
        var data = await response.json();
        showPosts(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        console.log(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        maxPages = data.users.length / 8;
        console.log(maxPages, currentPage+1)
    };
    loadPosts();

    function showPosts(pdata){
        document.getElementById("table").innerHTML = "";        //empty table
        var container = document.getElementById("table");       //insert in table
        pdata.forEach(element => {
            var row = document.createElement("div");
            var status;
            if(!element.showpost) {
                status = "hidden"
            } else {
                status = "shown"
            }
            row.classList.add("row");
            row.innerHTML = `
                <div class="col-left">
                    <h2>${element.title}</h2>
                </div>
                <div class="col-right">
                    <button class="${status} susButton">
                    </button>
                    <button class="remButton" data-username="${element.postid}">
                        <i class="icon-trash , icon"></i>
                    </button>
                </div>
            `
            container.appendChild(row)
        });
    }
   
});
