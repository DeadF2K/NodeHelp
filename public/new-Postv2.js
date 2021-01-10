document.addEventListener("DOMContentLoaded", function(){
    const editorButtons = document.getElementsByClassName('editor-button');
    const setAttribute = (element) => {
        document.execCommand(element.dataset.attribute, false);
    };

    for(let i = 0; i <editorButtons.length; i++) {
        editorButtons[i].addEventListener('click', function(){
            setAttribute(this);
        });
    }

    document.getElementById("cancelBtn").onclick = function(){
        window.location = "/main";
    }

    document.getElementById("add").onclick = function(){
        document.execCommand("insertImage", false, document.getElementById("url").value);
    }

    const textColor = document.getElementById("forecolor")
    textColor.addEventListener('change', function(){
        setColor(this);
    });
    const setColor = (element) => {
        console.log(element);
        document.execCommand(element.dataset.attribute, false, element.value);
    };

    const backColor = document.getElementById("backcolor");
    const helo = document.getElementsByClassName("canvas");
    backColor.addEventListener('change', function(){
        console.log(this);
        for(let i = 0; i <helo.length; i++) {
            helo[i].style.backgroundColor = backColor.value;
        };
    });

    document.getElementById("submit-post").onclick = function(){
        const title = document.getElementById('title-canvas').innerHTML;
        const content = document.getElementById('editor-canvas').innerHTML;
        const date_begin = document.getElementById('startDate').value;
        const date_end = document.getElementById('endDate').value;
        const bcolor = document.getElementById('backcolor').value;
        var bodyContent = {title:title, text:content, startDate:date_begin, endDate:date_end, bcolor:bcolor};
        send(bodyContent);

    };

    async function send(bodyContent){
        console.log(bodyContent);
        var response = await fetch("/newpost", {
            method: "POST",
            headers: {
                "Accept":"application/json",
                "Content-Type":"application/json"
        },
        body:JSON.stringify(bodyContent)
        });
        var data = await response.json();
        console.log(data);
        console.log(helo);
        window.location = "/main";
    }

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