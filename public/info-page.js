document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("topper").onclick = function(){
        window.location = "/main";
    }

    var maxPages;
    var currentPage = 0;
    var maxDisplayed = 8;
    async function loadPosts(){
        var response = await fetch("/getliveposts", {
            method: "GET",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            }
        })
        
        var data = await response.json();
        //console.log(data);
        try{
        showPosts(data.posts.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        //console.log(data.posts.slice(0 + (currentPage * maxDisplayed), maxDisplayed + (currentPage * maxDisplayed)));
        maxPages = data.posts.length / 8;
        //console.log(maxPages, currentPage+1)
        }catch(error){
            document.getElementById("content").innerHTML = "";        //empty content
        }
    };
    loadPosts();

    function showPosts(pdata){
        var container = document.getElementById("content");     //insert in content
        container.innerHTML = ""                                //empty content
        pdata.forEach(element => {
            var post = document.createElement("div");
            post.classList.add("post");
            post.style.backgroundColor = element.bcolor;
            post.innerHTML = `
                <div class="title" style="background-color:${element.bcolor};">
                    <h2>${element.title}</h2>
                </div>
                <div class="body">
                    ${element.text}
                </div>
            `
            container.appendChild(post)
        });
    }

    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        document.getElementById('clock').innerHTML =
        h + ":" + m + ":" + s;
        var t = setTimeout(startTime, 500);
      }
      function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
      }
      startTime();
});

