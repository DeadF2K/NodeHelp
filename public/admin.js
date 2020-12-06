document.addEventListener("DOMContentLoaded", function(){
    var form = document.getElementById("formNewUser");
    form.addEventListener("submit", function(e){
        e.preventDefault();
        console.log("Sending Formular")
        async function register(){
            var email = document.getElementById("email").value;
            var username = document.getElementById("username").value;
            var bodyContent = {email:email, username:username};
            var response = await fetch("/newuser", {
                method: "POST",
                headers: {
                    "Accept":"application/json",
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(bodyContent)
            });
            var data = await response.json();
            console.log(data);
            loadUsers();
        }
        register();
    });


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
            if(element.suspended) {
                status = "suspended"
            } else {
                status = "notSuspended"
            }
            row.classList.add("row");
            row.innerHTML = `
                <div class="col-left">
                    <h2>${element.username}</h2>
                </div>
                <div class="col-right">
                    <button class="${status} susButton" data-username="${element.username}"></button>
                    <button class="remButton" data-username="${element.username}">
                        <i class="icon-trash"></i>
                    </button>
                </div>
            `
            container.appendChild(row)
        });
    }

    async function toggleSus(pun){
            var response = await fetch("/toggleSus", {
                method: "POST",
                headers: {
                    "Accept":"application/json",
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({username:pun})
            })
            var data = await response.json();
            console.log(data);
            if(data.suc || !data.suc){
                loadUsers();
            }
    };


    document.addEventListener("click", function(e){
        if(e.target && e.target.classList.contains("susButton")){
            var un = e.target.getAttribute("data-username");
            toggleSus(un);
        }
    })


    /*-----New User Popup-----*/
    const openPopupBtns = document.querySelectorAll("[data-popup-target]");
    const closePopupBtns = document.querySelectorAll("[data-close-btn]");
    const overlay = document.getElementById("overlay");

    openPopupBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const popup = document.querySelector(btn.dataset.popupTarget);
            openPopup(popup);
        })
    });

    closePopupBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const popup = btn.closest(".popup")
            closePopup(popup);
        })
    });

    function openPopup(popup) {
        if (popup == null) return
        popup.classList.add("active");
        overlay.classList.add("active");
    }

    function closePopup(popup) {
        if (popup == null) return
        popup.classList.remove("active");
        overlay.classList.remove("active");
    }
    
});
