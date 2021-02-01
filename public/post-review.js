document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("cancelBtn").onclick = function(){
        window.location = "/main";
    }

    var id;
    async function loadPost(){
        var response = await fetch("/getReviewPost", {
            method: "GET",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
            }
        })
        var data = await response.json();
        id = data.post[0].postid;
        document.getElementsByClassName("canvas")[0].style.backgroundColor = data.post[0].bcolor;
        document.getElementsByClassName("canvas")[1].style.backgroundColor = data.post[0].bcolor;
        document.getElementById("title-canvas").innerHTML = data.post[0].title;
        document.getElementById("editor-canvas").innerHTML = data.post[0].text;

        if(data.post[0].showpost) {
            document.getElementById("submit-post").innerHTML = "Suspend Post"
        } else {
            document.getElementById("submit-post").innerHTML = "Confirm Post"
        }
    };
    loadPost();
    
    document.getElementById("submit-post").onclick = function(){
        toggleShow(id);
    }

    async function toggleShow(pun){
            var response = await fetch("/toggleShow", {
                method: "POST",
                headers: {
                    "Accept":"application/json",
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({postid:pun})
            })
            var data = await response.json();
            console.log(data);
            if(data.suc || !data.suc){
                window.location = "/main"
            }
    };
});