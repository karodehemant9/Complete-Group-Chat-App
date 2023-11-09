const socket = io('http://localhost:4000');
localStorage.setItem('room', 1);
localStorage.setItem('activeGroupId', 1);
localStorage.setItem('activeGroupName', 'Default');
const token = localStorage.getItem('token')
let userId = localStorage.getItem('userId');
let activeGroupId = localStorage.getItem('activeGroupId');
let room = localStorage.getItem('room');
socket.emit('join-room', room);
let userGroups = [];
let groupMembers = [];



window.addEventListener('DOMContentLoaded', function () {
    const actionMenu = document.querySelector('#maindiv');
    const chatHeader = document.querySelector('.logo');

    chatHeader.addEventListener('click', function () {
        if (actionMenu.style.display === 'block') {
            actionMenu.style.display = 'none';
        } else {
            actionMenu.style.display = 'block';
        }
    });
});


window.addEventListener('DOMContentLoaded', function () {
    displayGroup();
    getAllMessagesFromDB();
    document.getElementById('sendbutton').addEventListener('click', async (e) => {
        e.preventDefault();
        sendMessageToServer();
    })

    const exitChatButton = document.getElementById('exitchatbtn');
    exitChatButton.textContent = `${localStorage.getItem('user')}, Logout`;
    exitChatButton.addEventListener('click', async (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'http://localhost:4000/login/login.html';
    })

    document.getElementById('groupbtn').addEventListener('click', async (e) => {
        e.preventDefault();
        const groupName = prompt('Enter your group name');
        createGroup(groupName);
    })

})



async function createGroup(groupName) {
    const userId = localStorage.getItem('userId');
    
    const group = { groupName: groupName, userId: userId };

    try {
        const response = await axios.post('http://localhost:4000/groups', group, { headers: { Authorization: token } });
        const data = { groupName: response.data.newGroup.groupName, groupId: response.data.newGroup.groupId }
        localStorage.setItem('activeGroupId', data.groupId);
        localStorage.setItem('room', data.groupId);
        localStorage.setItem('activeGroupName', data.groupName);
        displayGroup(data);
    } catch (err) {
        console.log(err)
    }
}




async function getAllGroupsfromDB() {
    try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:4000/groups/${userId}`, { headers: { Authorization: token } });
        userGroups = [...response.data];
    } catch (err) {
        console.log(`Unable to get groups from DB ${err}`)
    }
}



//show all groups of the user
async function displayGroup() {
    await getAllGroupsfromDB();
    const grouplist = document.getElementById('grouplist');
    grouplist.innerHTML = '';

    userGroups.forEach((data) => {
        const groupId = data.groupId;
        const groupName = data.groupName;
    
        
        const newGroup = document.createElement('div');
        newGroup.className = 'newgrouplist';
        newGroup.textContent = groupName;


        
        newGroup.addEventListener('click', function () {
            console.log(`executing newGroupHandling method for this group : ${groupName}`);
            newGroupHandling(data);
        })


        
        grouplist.appendChild(newGroup);


        if (groupName === 'Default') {
            newGroup.click();
        }

    })
}





async function newGroupHandling(data) {
    const groupId = data.id;
    const groupName = data.groupName;

    localStorage.setItem('activeGroupName', groupName);
    localStorage.setItem('activeGroupId', groupId);
    localStorage.setItem('room', groupId);

    const room = groupId;
    socket.emit('join-room', room);

    const userlistpane = document.getElementById('maindiv');
    const chatHeader = document.querySelector('.logo');
    chatHeader.textContent = groupName;

    const actionMenu = document.querySelector('#maindiv');
    actionMenu.style.display = 'none';

    await getAllMessagesFromDB();
    await getGroupMembers(activeGroupId);

    console.log(userlistpane);
    chatHeader.addEventListener('click', async () => {
        userlistpane.innerHTML = '';
        console.log('user list pane after emtying it');
        // Clone the element
        const elementClone = userlistpane.cloneNode(true);

        console.log(elementClone);
        console.log('user list pane after emtying it');

        // Create the form element
        const addFriendForm = document.createElement('form');
        addFriendForm.id = 'addFriendForm';

        // Create the form group container
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        // Create the label element
        const label = document.createElement('label');
        label.setAttribute('for', 'email');
        label.textContent = 'Add a friend to group';

        // Create the input element
        const input = document.createElement('input');
        input.type = 'email';
        input.className = 'form-control';
        input.id = 'email';
        input.placeholder = 'Enter Email ID';

        // Append the label and input to the form group container
        formGroup.appendChild(label);
        formGroup.appendChild(input);

        // Append the form group container to the form
        addFriendForm.appendChild(formGroup);



        // Create the button element
        const addUserBtn = document.createElement('button');
        addUserBtn.id = 'add-friend-button';
        addUserBtn.textContent = 'Add Friend';

        // Create the button element
        const leaveGroupButton = document.createElement('button');
        leaveGroupButton.id = 'leave-group-button';
        leaveGroupButton.textContent = 'Leave Group';

        // Create the button element
        const deleteGroupbtn = document.createElement('button');
        deleteGroupbtn.id = 'delete-group-button';
        deleteGroupbtn.textContent = 'Delete Group';


        userlistpane.appendChild(addFriendForm);
        userlistpane.appendChild(addUserBtn);
        userlistpane.appendChild(leaveGroupButton);
        userlistpane.appendChild(deleteGroupbtn);


        addUserBtn.addEventListener('click', function (e) {
            const email = { email: input.value, activeGroupId: groupId }
            addMember(e, email);
        })
        leaveGroupButton.addEventListener('click', function (e) {
            leaveGroup(e);
        })
        deleteGroupbtn.addEventListener('click', function (e) {
            deleteGroup(e);
        })

        console.log(`executing getGroupMembers method for this group @@ : ${groupName}`);
        showUserOnScreen();
    })

}



async function addMember(e, email) {
    e.preventDefault();
    //if admin add user axios call and add a list at frontend
    try {
        const response = await axios.post(`http://localhost:4000/groups/members`, email, { headers: { Authorization: token } })
        console.log("response of member added", response)
        if (response.data.success === false)
        {
            alert("You are not Admin");
        } 
        await getGroupMembers(activeGroupId);
        showUserOnScreen();
    } catch (err) {
        console.log("unable to send request", err)
    }
}



async function leaveGroup(e) {
    try {
        activeGroupId = localStorage.getItem('activeGroupId'); 
        userId = localStorage.getItem('userId');   
        const response = await axios.delete(`http://localhost:4000/groups/leave/${activeGroupId}/${userId}`, { headers: { Authorization: token } })
        if (response.data.success === true) {
            alert(`Left group successfully`);
            location.reload();
        }
        else{
            alert("You are yourself Admin");
        }
    } catch (err) {
        console.log(err)
    }
}





async function deleteGroup(e) {
    //if admin delete group
    try {
        let activeGroupId = localStorage.getItem('activeGroupId');
        const response = await axios.delete(`http://localhost:4000/groups/delete/${activeGroupId}/${userId}`, { headers: { Authorization: token } })
        if (response.data.success === true) {
            alert("Group deleted successfully");
            location.reload();
        }

        if (response.data.success === false)
        {
            alert("You are not Admin");
        } 
    } catch (err) {
        console.log(err)
    }
}




async function getGroupMembers(activeGroupId) {
    activeGroupId = localStorage.getItem('activeGroupId');
    
    try {
        const response = await axios.get(`http://localhost:4000/groups/${activeGroupId}/users`, { headers: { Authorization: token } })
        console.log(response);
        groupMembers = [...response.data];
    }
    catch (err) {
        console.log(err);
    }
}




function showUserOnScreen() {
    let userlist = document.getElementById('userList');
    if (userlist) {
        userlist.innerHTML = '';
    }

    else {
        userlist = document.createElement('div');
        userlist.className = 'userlist';
        userlist.id = 'userList';
    }


    groupMembers.forEach((res) => {

        const userId = res.userId;
        const name = res.name;
       
        const memberElement = document.createElement('div');
        memberElement.id = 'memberElementDiv';


        const memberElementName = document.createElement('div');
        memberElementName.id = 'memberElementName';

        memberElementName.innerHTML = `
        <strong>${name}</strong>
    `;

        memberElement.appendChild(memberElementName);

        const makeAdminBtn = document.createElement('button');
        makeAdminBtn.className = 'btn btn-danger delete-edit-buttons';
        makeAdminBtn.id = 'makeAdminButton';
        makeAdminBtn.textContent = 'Make Admin';
        makeAdminBtn.addEventListener('click', () => {
        });


        const removeUserButton = document.createElement('button');
        removeUserButton.className = 'btn btn-danger delete-edit-buttons';
        removeUserButton.id = 'removeUserButton';
        removeUserButton.textContent = 'Remove User';
        removeUserButton.addEventListener('click', () => {
        });

        const memberActions = document.createElement('div');
        memberActions.id = 'memberActions';
        memberActions.appendChild(removeUserButton);
        memberActions.appendChild(makeAdminBtn);



        makeAdminBtn.addEventListener('click', async () => {
            try {
                const response = await axios.post(`http://localhost:4000/groups/makeAdmin/${activeGroupId}/${userId}`, {}, { headers: { Authorization: token } })
                if (response.data.success === true)
                {
                    alert('user is now admin of this group');
                } 
                else{
                    alert('you are not admin of this group');
                }
            } catch (err) {
                console.log(err);
            }

        })


        removeUserButton.addEventListener('click', async () => {
            try {
                const response = await axios.delete(`http://localhost:4000/groups/members/${activeGroupId}/${userId}`, { headers: { Authorization: token } })
                if (response.data.success === true) {
                    alert('user removed from the group');
                }
                else{
                    alert('you are not admin of this group');
                }
                await getGroupMembers(activeGroupId);
                showUserOnScreen();
            } catch (err) {
                console.log(err);
            }
        })

        memberElement.appendChild(memberActions);
        const userlistpane = document.getElementById('maindiv');
        userlist.appendChild(memberElement);
        userlistpane.appendChild(userlist);
    })
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
        const response = await axios.get(`http://localhost:4000/messages/${activeGroupId}`, { headers: { Authorization: token } })
        clearMessages();
        console.log("response from getMessages method");
        console.log(response);

        const messages = {};
        for (let i = 0; i < response.data.allMessage.length; i++) {
            let message = response.data.allMessage[i].text;
            let id = response.data.allMessage[i].id;
            let name = response.data.allMessage[i].user.name;
            messages[id] = { name: name, message: message };
            const isUser = (response.data.allMessage[i].userId == userId);
            displayMessage(isUser ? "you" : name, message)
        }

        localStorage.setItem('chatMessages', JSON.stringify(messages));

    } catch (err) {
        console.log("Unable to get messages", err)
    }
}



async function sendMessageToServer() {
    const messageinput = document.getElementById('messageinput');
    const messageText = messageinput.value;
    const room = localStorage.getItem('room');
    const activeGroupId = localStorage.getItem('activeGroupId');
    const message = { message: messageText, token: token, activeGroupId: activeGroupId };
    if (!token)
    {
        return;
    } 
    try { 
        displayMessage("you", message.message);
        const response = await axios.post('http://localhost:4000/messages', message, { headers: { Authorization: token } })
        messageinput.value = "";
        socket.emit('send-message', message, room);
    } catch (err) {
        console.log("unable to send", err)
    }
}


function clearMessages() {
    const chatMessages = document.querySelector(".messages");
    chatMessages.innerHTML = '';
}



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
    messageContainer.classList.add(sender === "you" ? "my-message" : "other-message");

    const nameContainer = document.createElement('div');
    nameContainer.classList.add("name");
    nameContainer.textContent = sender + ":";

    const br = document.createElement('br');
    nameContainer.appendChild(br);


    const textContainer = document.createElement("div");
    textContainer.classList.add(sender === "you" ? "mytext" : "sendertext");


    if (message.includes("https://expense-tracker123")) {
        
        const downloadLink = document.createElement("a");
        downloadLink.href = message; 
        downloadLink.textContent = "Download File"; 
        downloadLink.setAttribute("download", "image.jpg"); 

        textContainer.appendChild(downloadLink);
    }
    else{
        textContainer.textContent = message;
    }
    

    messageContainer.appendChild(nameContainer);
    messageContainer.appendChild(textContainer);

    messages.appendChild(messageContainer);
    messages.scrollTop = messages.scrollHeight;
}













//user-joined to server and receive broadcast for the same from server
socket.on('connect', () => {
    socket.emit('new-user-joined', token);
})

socket.on('user-joined-broadcast', user => {
    console.log(user)
    updateMessage(`${user.name} joined the chat`);
})


//when user sends a message
socket.on('receive-message-all', data => {
    console.log("client recieved msg data", data);
    displayMessage(data.user, data.message);
})

//when user sends a message
socket.on('receive-message-room', data => {
    console.log("client recieved msg data", data);
    displayMessage(data.user, data.message);
})

//user-left broadcast
socket.on('user-left', user => {
    updateMessage(`${user} left the chat`);
})










// function uploadFile(){
//-------------------------------------------------------------------------------
const sendfilebtn = document.getElementById('sendfilebtn');
const fileinput = document.getElementById('fileInput');
sendfilebtn.addEventListener('click', () => {
    fileinput.click();
})

fileinput.addEventListener('change', async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
        const formData = new FormData();
        activeGroupId = localStorage.getItem('activeGroupId');
        formData.append('file', selectedFile);
        formData.append('token', token);
        formData.append('activeGroupId', activeGroupId);

        // for (var key of formData.entries()) {
        //     console.log(key[0]);
        //     console.log(key[1]);
        // }

        try {
            const response = await axios.post(`http://localhost:4000/messages/uploadFile`, formData, { headers: { Authorization: token } })
            const url = response.data.fileUrl;
            if (!response.data.success) {
                return alert('no true response');
            }
            else {
                const message = { message: url, token: token, activeGroupId: activeGroupId };
                displayMessage("you", url);
                const room = localStorage.getItem('room');
                socket.emit('send-message', message, room);
            }
        } catch (err) {
            console.log("error uploading file", err)
        }
    }
})

























































































































// function getAllMessagesFromLS() {
//     const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     const chatMessages = document.querySelector(".messages");
//     chatMessages.innerHTML = '';
//     if (messages.length > 10){
//         messages = messages.slice(messages.length - 10);
//     } 
//     for (let i = 0; i < messages.length; i++){
//         displayMessage("you", messages[i]);
//     }
// }
