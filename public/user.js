document.addEventListener("DOMContentLoaded", function(){    
    /*changin page*/
    var pageUp = document.getElementById("pageUp");
    var pageDown = document.getElementById("pageDown");
    var reviewButtons = document.getElementsByClassName('editButton');

    

    document.getElementById("changePwBtn").onclick = function(){
        window.location = "/new-password";
    }

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
        if(e.target && e.target.classList.contains("remButton")){
            var postid = e.target.getAttribute("data-username");
            deletePost(postid);
        }
    })

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
        try{
        showPosts(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        console.log(data.users.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        maxPages = data.users.length / 8;
        console.log(maxPages, currentPage+1)
        reviewButtons = document.getElementsByClassName('editButton');
        console.log(reviewButtons.length);
        addButtons();
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
            if(!element.showpost) {
                status = "hidden icon-eye-close"
            } else {
                status = "shown icon-eye-open"
            }
            row.classList.add("row");
            row.innerHTML = `
                <div class="col-left">
                    <h2>${element.title}</h2>
                </div>
                <div class="col-right">
                    <button class="editButton" data-username="${element.postid}">
                        <i class="icon-file-text-alt , icon"></i>
                    </button>
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
   
    async function reviewPost(postid){
        var response = await fetch("/updatePostID", {
            method: "POST",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            },
            body:JSON.stringify({postid:postid})
        })
        var data = await response.json();
        if(data || !data)
        {
        window.location = "/post-review";
        }
    };
    
    function addButtons(){
    for(let i = 0; i < reviewButtons.length; i++){
        reviewButtons[i].addEventListener('click', function(){
            reviewPost(this.dataset.username)
        })
    }
    }
});
