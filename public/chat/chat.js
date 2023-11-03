const token = localStorage.getItem('token')





window.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('sendbutton').addEventListener('click', async (e) => {
        e.preventDefault();
        
    })

    document.getElementById('exitchatbtn').addEventListener('click', async (e) => {
        e.preventDefault();
        //redirecting to signup page
        const destinationURL = "../login/login.html";
        // Redirect to the destination page
        window.location.href = destinationURL;
        
    })

    document.getElementById('groupbtn').addEventListener('click', async (e) => {
        e.preventDefault();
        const groupname = prompt('Enter your group name');
        
    })

})

