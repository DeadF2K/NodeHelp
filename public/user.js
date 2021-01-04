document.addEventListener("DOMContentLoaded", function(){    
    /*changin page*/
    var pageUp = document.getElementById("pageUp");
    var pageDown = document.getElementById("pageDown");

    pageUp.addEventListener("click", () => {
        if(maxPages > currentPage+1) {
            currentPage++;
            loadUsers();
        }
    });

    pageDown.addEventListener("click", () => {
        if(currentPage > 0){
            currentPage--;
            
            loadUsers();
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
    async function loadUsers(){
        var response = await fetch("/getusers", {
            method: "GET",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            }
        })
        var data = await response.json();
        showUsers(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        console.log(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        maxPages = data.users.length / 8;
        console.log(maxPages, currentPage+1)
    };
    loadUsers();

    function showUsers(pdata){
        document.getElementById("table").innerHTML = "";        //empty table
        var container = document.getElementById("table");       //insert in table
        pdata.forEach(element => {
            var row = document.createElement("div");
            var status;
            var susbuttonstate;
            if(element.suspended) {
                status = "suspended"
                susbuttonstate = "icon-pause"
            } else {
                status = "notSuspended"
                susbuttonstate = "icon-play"
            }
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
   
});
