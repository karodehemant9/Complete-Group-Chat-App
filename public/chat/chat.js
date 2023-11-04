// const { response } = require("express");
const socket = io('http://localhost:3000')
const token = localStorage.getItem('token')                      
let activeGroupId = localStorage.getItem('activeGroupId');
let userId = localStorage.getItem('userId');


window.addEventListener('DOMContentLoaded',function(){
    getAllGroupsfromDB();
    // getAllMessagesFromDB();
    document.getElementById('sendbutton').addEventListener('click', async(e)=>{
        e.preventDefault();
        sendMessageToServer();
    })
    
    document.getElementById('exitchatbtn').addEventListener('click', async(e)=>{
       e.preventDefault();
        window.location.href ='http://localhost:3000';
    })
    
    document.getElementById('groupbtn').addEventListener('click', async(e)=>{
        e.preventDefault();
        const groupname = prompt('Enter your group name');
         createGroup(groupname);
     })
    
})


async function getAllGroupsfromDB(){
    try{
         const userId = localStorage.getItem('userId');
         console.log(userId)
        const response = await axios.get(`http://localhost:3000/group/fetchGroup/${userId}`, {headers:{Authorization: token}});
        for(let i=0; i<response.data.length; i++){
            displayGroup(response.data[i]);
        }
    }catch(err){
        console.log(`Unable to get groups from DB ${err}`)
    }
}

async function displayGroup(data){
    //show all groups of the user
    const groupname = data.groupname;
    const groupId = data.id;
    const grouplist = document.getElementById('grouplist');
    const newGroup = document.createElement('div');
    newGroup.className = 'newgrouplist';
    newGroup.textContent = groupname;
    grouplist.appendChild(newGroup);

    //define each groups messages and clicks
    newGroup.addEventListener('click', async ()=>{
        localStorage.setItem('activeGroupName', groupname);
        localStorage.setItem('activeGroupId', groupId)
        const chatHeader = document.querySelector('.logo');
        chatHeader.textContent = groupname;
        await getAllMessagesFromDB();    

        const userlistpane = document.getElementById('userlistpane');     
        chatHeader.addEventListener('click', async ()=>{
            userlistpane.innerHTML = '';
            userlistpane.classList.toggle("show");
            const header =`<h1> Members</h1>`
            const id = groupId;
            const addUserInput = document.createElement('input');
            addUserInput.type = 'text';
            addUserInput.className = 'adduserinput';
            addUserInput.placeholder = 'user email';
            const addUserBtn = document.createElement('button');
            addUserBtn.className = "btn";
            addUserBtn.id = 'adduserbtn';
            addUserBtn.textContent = 'Add Member';

            addUserBtn.addEventListener('click', async(e)=>{
             e.preventDefault();
              //if admin add user axios call and add a list at frontend
             const email = {email:addUserInput.value, activeGroupId: groupId} ;
              try{
                  const response = await axios.post(`http://localhost:3000/group/addMember`,email, {headers: {Authorization:token}})
                  console.log("response of member added", response)
                  showUserOnScreen(response.data.newGroupMember)
                 }catch(err){
                        console.log("unable to send request", err)
                }    
            })
        
            const exitGroupBtn = document.createElement('button');
            exitGroupBtn.textContent = 'Leave Group';
            exitGroupBtn.className = 'btn';
            exitGroupBtn.id = 'exitgroupbtn';
                exitGroupBtn.addEventListener('click', async ()=>{
                    try{
                        const response = await axios.delete(`http://localhost:3000/group/exitGroup/${activeGroupId}/${userId}`, {headers: {Authorization:token}})
                        if(response.data.success === true) alert(`Left group successfully`);
                    }catch(err){
                        console.log(err)
                    }
            })  

            const deleteGroupbtn = document.createElement('button');
            deleteGroupbtn.textContent = 'Delete Group'
            deleteGroupbtn.className = 'btn';
            deleteGroupbtn.id = 'deletegroupbtn';
           
            deleteGroupbtn.addEventListener('click', async ()=>{
                //if admin delete group
            try{
                const response = await axios.delete(`http://localhost:3000/group/deleteGroup/${activeGroupId}`, {headers: {Authorization: token}})
                if(response.data.success === true) alert("Group deleted successfully");
                if(response.data.success === false) alert("You are not Admin");
            }catch(err){
                console.log(err)
            }
    
         })  
         userlistpane.appendChild(addUserInput)
         userlistpane.appendChild(addUserBtn);
         userlistpane.appendChild(deleteGroupbtn)
         userlistpane.appendChild(exitGroupBtn); 
         
        const userlist = await displayGroupMembers(activeGroupId);   
        userlistpane.appendChild(userlist);   
    })  
        
})
}

   async function displayGroupMembers(activeGroupId){
         const userlist = document.createElement('div'); 
        userlist.className = 'userlist';
        try{
            const response = await axios.get(`http://localhost:3000/group/fetchGroupUsers/${activeGroupId}`, {headers: {Authorization: token}})
            response.data.forEach(async (res)=>{
                 const memberElement = await showUserOnScreen(res);
                 userlist.appendChild(memberElement); 
                 
                })
         }catch(err){
            console.log(err)
        }
        console.log(userlist)
        return userlist;
}


function showUserOnScreen(res){
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

    deleteUserBtn.addEventListener('click', async ()=>{
            try{
                const response = await axios.delete(`http://localhost:3000/group/deleteMember/${activeGroupId}/${userId}`, {headers: {Authorization: token}})
                if(response.data.success === true) alert('user removed from the group');
                // userlist.removeChild(memberElement);

            }catch(err){
                console.log(err)
            }  
    })

    makeAdminBtn.addEventListener('click', async ()=>{
        try{
            const response = await axios.post(`http://localhost:3000/group/makeAdmin/${activeGroupId}/${userId}`, {}, {headers: {Authorization:token}})
            if(response.data.success === true) alert('user is now admin of this group');
            // memberElement.removeChild(makeAdminBtn);
        }catch(err){
            console.log(err)
        }

     })
        
        return memberElement;
        

}

// function to get all messages of a group
async function getAllMessagesFromDB(){
    const userId = localStorage.getItem('userId');
    const activeGroupId = localStorage.getItem('activeGroupId');
    if(!token || !userId){
        console.log("No new messages in local storage");
        return;
    }
    try{
        const response = await axios.get(`http://localhost:3000/getMessage/${activeGroupId}`, {headers:{Authorization:token}})  
        clearMessages();
        const messages = {};   
         for(let i=0; i<response.data.allMessage.length; i++){
            let message = response.data.allMessage[i].message;
            let id = response.data.allMessage[i].id;
            let name = response.data.allMessage[i].user.name;
            messages[id]= {name: name, message: message};
            const isUser = (response.data.allMessage[i].userId == userId);
            displayMessage(isUser ? "you" : name, message)
         }
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            
    }catch(err){
        console.log("Unable to get message from local storage", err)
    }
}


    
async function sendMessageToServer(){
        const messageinput = document.getElementById('messageinput');
        const messageText = messageinput.value;
        const message = {message: messageText, token:token, activeGroupId};
        if(!token) return;
        try{  
            console.log("token found sending msg")
            socket.emit('send-message', message);
            displayMessage("you", message.message);
            const response = await axios.post('http://localhost:3000/sendMessage', message, {headers:{Authorization: token}})
            console.log("response",response)
            messageinput.value="";
        }catch(err){
            console.log("unable to send", err)
        }        
  }

  function clearMessages(){
    const chatMessages = document.querySelector(".messages");
    chatMessages.innerHTML = '';
}

//user-joined to server and receive broadcast for the same from server
socket.on('connect', ()=>{
    socket.emit('user-joined', token);  
})

socket.on('user-joined-broadcast', user=>{
    console.log(user)
    updateMessage(`${user.name} joined the chat`);
})


//when user sends a message
socket.on('receive-message', data=>{
    //console.log("client msg data", data);
    displayMessage(data.user, data.message);
})

//user-left broadcast
socket.on('user-left', user=>{
    updateMessage(`${user} left the chat`);
})

function updateMessage (message) {
    const messages = document.querySelector(".messages");
    const messageContainer = document.createElement("div");
    messageContainer.classList.add( "update");
    messageContainer.textContent = message;
    messages.appendChild(messageContainer);
    messages.scrollTop = messages.scrollHeight;
}




async function createGroup(groupname){
    const userId = localStorage.getItem('userId');
    const groupName = groupname;
    const group = {groupname: groupName, userId: userId};

    try{
        console.log(group)
        const response = await axios.post('http://localhost:3000/group/createGroup', group,  {headers:{Authorization:token}});
        const data = {groupname: response.data.newGroup.groupname, groupId: response.data.newGroup.groupId}
        localStorage.setItem('activeGroupId', data.groupId );
        localStorage.setItem('activeGroupName', data.groupname);
        displayGroup(data);
    }catch(err){
        console.log(err)
    }
}




function displayMessage (sender, message) {
    const messages = document.querySelector(".messages");

    const messageContainer = document.createElement("div");
    messageContainer.classList.add( sender=="you" ? "my-message" : "other-message");

    const nameContainer = document.createElement('div');
    nameContainer.classList.add("name");
    nameContainer.textContent = sender +":";

    const br = document.createElement('br');
    nameContainer.appendChild(br);

    const textContainer = document.createElement("div");
    textContainer.classList.add( sender==="you" ? "mytext" : "sendertext");
    textContainer.textContent = message;

    messageContainer.appendChild(nameContainer);
    messageContainer.appendChild(textContainer);

    messages.appendChild(messageContainer);
    messages.scrollTop = messages.scrollHeight;
}
    
    // function uploadFile(){
    //-------------------------------------------------------------------------------
    const sendfilebtn = document.getElementById('sendfilebtn');
    const fileinput = document.getElementById('fileInput');
    sendfilebtn.addEventListener('click', ()=>{
        fileinput.click();
    })
    fileinput.addEventListener('change', async(e)=>{
        const selectedFile = e.target.files[0];
        if(selectedFile){
            const data = new FormData();
            data.append('file', selectedFile);
            try{
                response = await axios.post(`http://localhost:3000/message/uploadFile/${activeGroupId}`, data,  {headers:{Authorization: token}})
                const url = response.data.url;  
                if(!response.data.success) return alert('no true response')
                else{
                const img = document.createElement('img');
                const chatscreen= document.querySelector('.messages');
                chatscreen.appendChild(img);    
                }      
            }catch(err){
                console.log("error uploading file", err)
            }
        }
    })
// }
























// function getAllMessagesFromLS(){
//     const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
//     const chatMessages = document.querySelector(".messages");
//     chatMessages.innerHTML = '';
//     if(messages.length>10)messages = messages.slice(messages.length-10);
//     for(let i=0; i<messages.length; i++)displayMessage("you", messages[i]);            
// }