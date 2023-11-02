
const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputPhone = document.getElementById("phoneNo");
const signupBtn = document.getElementById("signupBtn");
const signinBtn = document.getElementById("signinBtn");
const nameField = document.getElementById("nameField");
const phoneField = document.getElementById("phoneField");
const title = document.getElementById("title");
const err = document.getElementById("errMessage");


const forgotpasswordLink = document.getElementById("forgotPasswordId");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");



signupBtn.onclick = async function (event) {
    event.preventDefault(event);
    nameField.style.maxHeight = "65px";
    phoneField.style.maxHeight = "65px";
    //title.innerHTML = "Sign Up";
    signupBtn.classList.remove("disable");
    signinBtn.classList.add("disable");

    err.style.display = "none";

    const name = inputName.value;
    const email = inputEmail.value;
    const password = inputPassword.value;
    const phoneNo = inputPhone.value;

    const user = { name, email, password, phoneNo };

    if (!name || !email || !password || !phoneNo) {
        return;
    }

    try {
        axios.post('http://localhost:9000/user/signup', user)
            .then(response => {
                console.log('Signup successful');
                if (response.data.success === true) {
                    alert('Successfully signed up');
                }

                if (response.data.success === false && response.status === 200) {
                    alert('User already exists, Please Login');
                }

            })
            .catch(err => {
                console.log("Error axios:", err.response);
                if (err.response && err.response.status === 400 && err.response.data === 'Email already registered') {
                    const modal = document.getElementById("modal");
                    const modalmsg = document.getElementById("modalmsg");
                    modal.style.display = "block";
                    modalmsg.textContent = `${email} is already registered`;

                } else {
                    console.error('Signup failed', err);
                }

            })

    } catch (err) {
        console.log("Error during signup", err);
    }
}








signinBtn.onclick = function (event) {
    event.preventDefault(event);
    nameField.style.maxHeight = "0";
    phoneField.style.maxHeight = "0";
    signupBtn.classList.add("disable");
    signinBtn.classList.remove("disable");

    err.style.display = "none";

    const email = inputEmail.value;
    const password = inputPassword.value;

    const obj = { email, password };

    if (!email || !password) {
        return;
    }

    try {
        axios.post('http://localhost:9000/user/signin', obj)
            .then(res => {
                console.log('Signin successful', res.data);

                if (res.status === 200 && response.data.success === true) {
                    localStorage.setItem('token', res.data.token);
                    window.location.href = "#";
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




forgotpasswordLink.onclick = function (event) {
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
            const response = await axios.post("http://localhost:9000/password/forgot-password", obj)

            alert(`Link sent to ${email} to create new password`);

        } catch (err) { console.log(err) }
        alert(`Error sending reset password link to ${email}`);
        forgotPasswordModal.style.display = "none";
    }
}