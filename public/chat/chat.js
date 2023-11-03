const socket = io('http://localhost:3000')
const token = localStorage.getItem('token')
let activeGroupId = localStorage.getItem('activeGroupId');
let userId = localStorage.getItem('userId');


const timerId = setInterval(getAllMessagesFromLS, 1000);

window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sendbutton').addEventListener('click', async (e) => {
        e.preventDefault();
        sendMessageToServer();
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
        createGroup(groupname);
    })

})





function showUserOnScreen(res) {
    const userId = res.userId;
    const name = res.name;
    console.log(res);

    const memberElement = document.createElement('div');
    memberElement.textContent = `${name}`;

    const makeAdminBtn = document.createElement('button');
    makeAdminBtn.textContent = 'Make Admin';
    makeAdminBtn.id = 'makeadmin';
    makeAdminBtn.className = 'btn';

    const deleteUserBtn = document.createElement('button');
    deleteUserBtn.className = 'btn';
    deleteUserBtn.id = 'removeuser';
    deleteUserBtn.textContent = 'Remove';


    memberElement.appendChild(makeAdminBtn)
    memberElement.appendChild(deleteUserBtn);

    deleteUserBtn.addEventListener('click', async () => {
        try {
            const response = await axios.delete(`http://localhost:3000/group/deleteMember/${activeGroupId}/${userId}`, { headers: { Authorization: token } })
            if (response.data.success === true) alert('user removed from the group');
            // userlist.removeChild(memberElement);

        } catch (err) {
            console.log(err)
        }
    })

    makeAdminBtn.addEventListener('click', async () => {
        try {
            const response = await axios.post(`http://localhost:3000/group/makeAdmin/${activeGroupId}/${userId}`, {}, { headers: { Authorization: token } })
            if (response.data.success === true) alert('user is now admin of this group');
            // memberElement.removeChild(makeAdminBtn);
        } catch (err) {
            console.log(err)
        }

    })

    return memberElement;


}








// function to get all messages of a group
async function getAllMessagesFromDB() {
    const userId = localStorage.getItem('userId');
    const activeGroupId = localStorage.getItem('activeGroupId');
    if (!token || !userId) {
        console.log("No new messages in local storage");
        return;
    }
    try {
        const response = await axios.get(`http://localhost:9000/getMessage/${activeGroupId}`, { headers: { Authorization: token } })
        clearMessages();
        const messages = {};
        for (let i = 0; i < response.data.allMessage.length; i++) {
            let message = response.data.allMessage[i].message;
            let id = response.data.allMessage[i].id;
            let name = response.data.allMessage[i].user.name;
            messages[id] = { name: name, message: message };
            const isUser = (response.data.allMessage[i].userId == userId);
            displayMessage(isUser ? "you" : name, message)
        }

        localStorage.setItem('chatMessages', JSON.stringify(messages));

    } catch (err) {
        console.log("Unable to get message from local storage", err)
    }
}




async function sendMessageToServer() {
    const messageinput = document.getElementById('messageinput');
    const messageText = messageinput.value;
    const message = { message: messageText, token: token, activeGroupId };
    if (!token) return;
    try {
        console.log("token found sending msg")
        socket.emit('send-message', message);
        displayMessage("you", message.message);
        const response = await axios.post('http://localhost:9000/sendMessage', message, { headers: { Authorization: token } })
        console.log("response", response)
        messageinput.value = "";
    } catch (err) {
        console.log("unable to send", err)
    }
}



function clearMessages() {
    const chatMessages = document.querySelector(".messages");
    chatMessages.innerHTML = '';
}



//user-joined to server and receive broadcast for the same from server
socket.on('connect', () => {
    socket.emit('user-joined', token);
})


socket.on('user-joined-broadcast', user => {
    console.log(user)
    updateMessage(`${user.name} joined the chat`);
})


//when user sends a message
socket.on('receive-message', data => {
    //console.log("client msg data", data);
    displayMessage(data.user, data.message);
})

//user-left broadcast
socket.on('user-left', user => {
    updateMessage(`${user} left the chat`);
})







function updateMessage(message) {
    const messages = document.querySelector(".messages");
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("update");
    messageContainer.textContent = message;
    messages.appendChild(messageContainer);
    messages.scrollTop = messages.scrollHeight;
}




function displayMessage(sender, message) {
    const messages = document.querySelector(".messages");

    const messageContainer = document.createElement("div");
    messageContainer.classList.add(sender == "you" ? "my-message" : "other-message");

    const nameContainer = document.createElement('div');
    nameContainer.classList.add("name");
    nameContainer.textContent = sender + ":";

    const br = document.createElement('br');
    nameContainer.appendChild(br);

    const textContainer = document.createElement("div");
    textContainer.classList.add(sender === "you" ? "mytext" : "sendertext");
    textContainer.textContent = message;

    messageContainer.appendChild(nameContainer);
    messageContainer.appendChild(textContainer);

    messages.appendChild(messageContainer);
    messages.scrollTop = messages.scrollHeight;
}




function getAllMessagesFromLS(){
    const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    const chatMessages = document.querySelector(".messages");
    chatMessages.innerHTML = '';
    if(messages.length>10){
        messages = messages.slice(messages.length-10);
    }

    for(let i=0; i<messages.length; i++){
        displayMessage("you", messages[i]);
    }
}