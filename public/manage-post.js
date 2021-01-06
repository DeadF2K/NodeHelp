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
    
    var mngBtn = document.getElementById("mngBtn");
    mngBtn.addEventListener("click", () => {
        window.location = "/main";
    });

    async function toggleSus(postid){
        var response = await fetch("/toggleShow", {
            method: "POST",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            },
            body:JSON.stringify({postid:postid})
        })
        var data = await response.json();
        console.log(data);
        if(data.suc || !data.suc){
            loadPosts();
        }
    };

    async function deletePost(postid){
        var response = await fetch("/deletePost", {
            method: "POST",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            },
            body:JSON.stringify({postid:postid})
        })
        var data = await response.json();
        console.log(data);
        if(data.suc || !data.suc){
            loadPosts();
        }
    };


    document.addEventListener("click", function(e){
        if(e.target && e.target.classList.contains("susButton")){
            var postid = e.target.getAttribute("data-username");
            toggleSus(postid);
        }else if(e.target && e.target.classList.contains("remButton")){
            var postid = e.target.getAttribute("data-username");
            deletePost(postid);
        }
    })

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
        try{
        showPosts(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        console.log(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        maxPages = data.users.length / 8;
        console.log(maxPages, currentPage+1)
        }catch(error){
            document.getElementById("table").innerHTML = "";        //empty table
        }
    };
    loadPosts();

    function showPosts(pdata){
        document.getElementById("table").innerHTML = "";        //empty table
        var container = document.getElementById("table");       //insert in table
        pdata.forEach(element => {
            var row = document.createElement("div");
            var status;
            var susbuttonstate;
            if(!element.showpost) {
                status = "hidden"
                susbuttonstate = "icon-pause"
            } else {
                status = "shown"
                susbuttonstate = "icon-play"
            }
            row.classList.add("row");
            row.innerHTML = `
                <div class="col-left">
                    <h2>${element.title}</h2>
                </div>
                <div class="col-right">
                    <button class="${status} susButton" data-username="${element.postid}">
                    <i class="${susbuttonstate} , icon"></i>
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