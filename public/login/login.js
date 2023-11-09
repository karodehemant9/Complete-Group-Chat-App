
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const title = document.getElementById("title");
const err = document.getElementById("errMessage");

const forgotpasswordBtn = document.getElementById("forgotPasswordId");
forgotpasswordBtn.addEventListener('click', forgetPasswordHandling);

const resetPasswordBtn = document.getElementById("resetPasswordBtn");


const signupBtn = document.getElementById("signupBtn");
const signinBtn = document.getElementById("signinBtn");

signupBtn.addEventListener('click', newUserHandling);
signinBtn.addEventListener('click', signin);


function newUserHandling(e) {
    //redirecting to signup page
    const destinationURL = "../signup/signup.html";
    // Redirect to the destination page
    window.location.href = destinationURL;
}




async function signin(e) {
    console.log('$$$$$$$$$$');

    e.preventDefault();
    err.style.display = "none";

    const email = inputEmail.value;
    const password = inputPassword.value;

    const obj = { email, password };

    if (!email || !password) {
        return;
    }

    try {
        axios.post('http://localhost:4000/user/signin', obj)
            .then(res => {
                console.log('Signin successful');
                console.log(res);


                if (res.status === 200 && res.data.success === true) {
                    console.log('token $$$$$$');
                    
                    console.log(res.data);
                    
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('userId', res.data.user.id);
                    localStorage.setItem('user', res.data.user.name);
                    //redirecting to signup page
                    const destinationURL = "../chat/chat.html";
                    // Redirect to the destination page
                    window.location.href = destinationURL;

                }
                else {
                    alert(response.data.message);
                }
            })
            .catch(err => {
                console.log("Error axios:", err.response);
                if (err.response && err.response.status === 400 && err.response.data === 'Email already registered') {
                    const modal = document.getElementById("modal");
                    const modalmsg = document.getElementById("modalmsg");
                    modal.style.display = "block";
                    modalmsg.textContent = `${email} is already registered with Catch`;

                } else {
                    console.error('Signin failed', err);
                }

            })

    }
    catch (err) { console.log("Error during signin", err) }
}





function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    const form = document.getElementById("form");
    form.reset();
}




function forgetPasswordHandling(event) {
    event.preventDefault();
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    forgotPasswordModal.style.display = "block";

    document.getElementById("closeModalBtn").addEventListener("click", function () {
        event.preventDefault();
        forgotPasswordModal.style.display = "none";
    })

    resetPasswordBtn.onclick = async function (event) {
        event.preventDefault();
        const email = document.getElementById("forgotPasswordEmail").value;
        const obj = { email: email }

        try {
            const response = await axios.post("http://localhost:4000/password/forgot-password", obj)

            alert(`Link sent to ${email} to create new password`);

        } catch (err) { console.log(err) }
        alert(`Error sending reset password link to ${email}`);
        forgotPasswordModal.style.display = "none";
    }
}