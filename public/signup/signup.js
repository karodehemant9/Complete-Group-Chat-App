const inputName = document.getElementById("name");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputPhone = document.getElementById("phoneNo");
const title = document.getElementById("title");
const err = document.getElementById("errMessage");
const forgotpasswordLink = document.getElementById("forgotPasswordId");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

const signupBtn = document.getElementById("signupBtn");
const signinBtn = document.getElementById("signinBtn");

signinBtn.addEventListener('click', existingUserHandling);
signupBtn.addEventListener('click', signup);



function existingUserHandling(e){
    //redirecting to signup page
    const destinationURL = "../login/login.html";
    // Redirect to the destination page
    window.location.href = destinationURL;     
}




async function signup(event) {
    event.preventDefault(event);

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



function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    const form = document.getElementById("form");
    form.reset();
}
