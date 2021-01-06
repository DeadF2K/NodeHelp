//write code in next section
//will run when DOM is loaded
document.addEventListener("DOMContentLoaded", function(){
    var form = document.getElementById("loginform");
    async function login() {
        var un = document.getElementById("un").value;
        var pw = document.getElementById("pw").value;
        var body = {username:un, password:pw};
        var response = await fetch("/login", {
            method:"POST",
            headers:{
                "Accept":"application/json",
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
        })
        var data = await response.json();
        console.log("Data: ");
        console.log(data);
        if(data.suc){
            window.location = "/main"
        } else {
            var loginText = document.getElementById("loginText");
            var inputs = document.getElementsByTagName("input")
            var inputList = Array.prototype.slice.call(inputs);

            loginText.classList.add("fadeout");
            setTimeout(function() {
                loginText.innerText = "Try Again";
                loginText.classList.remove("fadeout");
            }, 350);
            console.log(inputs);
            inputList.forEach(element => {
                element.style.borderBottom="1px solid #F00";
                if(element.getAttribute("type") === "password"){
                    element.value = "";
                    element.focus();
                }
            });
        }
    }
    form.addEventListener("submit", function(e){
        e.preventDefault();
        login();
    });
    var prevBtn = document.getElementById("prev")
    prevBtn.addEventListener("click", function(){
        window.location ="/info"
    })
});