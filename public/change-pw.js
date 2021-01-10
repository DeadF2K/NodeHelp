//write code in next section
//will run when DOM is loaded
document.addEventListener("DOMContentLoaded", function(){
    var form = document.getElementById("loginform");
    async function login() {
        var old_pw = document.getElementById("old_pw").value;
        var new_pw_1 = document.getElementById("new_pw_1").value;
        var new_pw_2 = document.getElementById("new_pw_2").value;
    
        var body = {old_password:old_pw, new_password_1:new_pw_1, new_password_2:new_pw_2};
        var response = await fetch("/changepw", {
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
        }
    }
    form.addEventListener("submit", function(e){
        e.preventDefault();
        login();
    });
});