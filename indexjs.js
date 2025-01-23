//firebase configuration
const firebaseConfig = {
        apiKey: "AIzaSyAHt06CtReHyQRip-QqEGILFjOWH5cI98c",
        authDomain: "blood-7b054.firebaseapp.com",
        databaseURL: "https://blood-7b054-default-rtdb.firebaseio.com",
        projectId: "blood-7b054",
        storageBucket: "blood-7b054.firebasestorage.app",
        messagingSenderId: "926378767902",
        appId: "1:926378767902:web:21591c4e5d77c90c9ca00f",
        measurementId: "G-HTGC1SJYH6"
      };
/*
  1. app // Initialize Firebase
  2. auth // Firebase Authentication
  3. database // Firebase Realtime Database
  4. authForm // Form element
  5. errorMessageDiv // Error message div
  6. toggleLink // Toggle link between login and sign up forms
  7. resetLink // Reset link for password reset
  8. formTitle // Form title
  9. authButton // Auth button
  10. loginContainer // Login container
  11. userCountDiv // User count div
*/
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const authForm = document.getElementById("auth-form");
const errorMessageDiv = document.getElementById("error-message");
const toggleLink = document.getElementById("toggle-link");
const resetLink = document.getElementById("reset-link");
const formTitle = document.getElementById("form-title");
const authButton = document.getElementById("auth-button");
const loginContainer = document.getElementById("login-container");
const userCountDiv = document.getElementById("user-count");

//>>>>>>>>
/*
    M in js : 
      1. addEventListener() // .addEventListener("click", () => {})
      2. classList.add() // Add the fade-out class to the container
      3. setTimeout() // Wait for the fadeOut animation to complete
      4. classList.remove() // Remove the fade-out class from the container
      5. classList.add() // Add the fade-in class to the container
      6. .textContent // Change the text content of the form title, auth button, and toggle link
      7. .add() // Add the fade-in class to the container
   
  */
  let isLogin = true;
  // Toggle between login and sign up forms
  toggleLink.addEventListener("click", () => {
    loginContainer.classList.add('fade-out'); // Fade out the container
    setTimeout(() => { // Wait for the fadeOut animation to complete
      isLogin = !isLogin;
      if (isLogin) {    // login form is displayed if isLogin is true
        formTitle.textContent = "Login Page";
        authButton.textContent = "Login";
        toggleLink.textContent = "Don't have an account? Sign up";
      } 
      else {       // sign up form is displayed if isLogin is false
        formTitle.textContent = "Sign Up Page";
        authButton.textContent = "Sign Up";
        toggleLink.textContent = "Already have an account? Login";
      }
      errorMessageDiv.textContent = "";

      loginContainer.classList.remove('fade-out');
      loginContainer.classList.add('fade-in');
    }, 500); // Match the duration of the fadeOut animation
  });
  //>>>>>>>>>>>



  //>>>>>>>>>>>
  /*
    M in js :
      1. addEventListener() // .addEventListener("click", () => {})
      2. prompt() // Prompt the user to enter their email address
    M in firebase :
      1. sendPasswordResetEmail() // Send password reset email

  */
  // Send password reset email using Firebase
  resetLink.addEventListener("click", () => {
    const email = prompt("Please enter your email address:"); // prompt() is used for demonstration purposes ; use a form input field in production like and alert
    if (email) { // Check if email is not null
        auth.sendPasswordResetEmail(email) // Send password reset email
            .then(() => {
                alert("Password reset email sent!");
            })
            .catch((error) => { // handling errors
                const errorCode = error.code; 
                const errorMessage = error.message; 
                console.log(errorCode, errorMessage);
                errorMessageDiv.textContent = "Error sending password reset email: " + errorMessage;
                errorMessageDiv.style.display = "block";
            });
    } else {   // Alert user if email is null
        alert("Please enter a valid email address.");
    }
  });
  //>>>>>>>>>>>



  //>>>>>>>>>>>
  /*
     M in js :
      1. fetch() // Fetch user's IP address and store it in Firebase
      2. .then() // Parse the JSON response (eg {"ip":"xxx.xxx.xxx.xxx"})
      3. .then() // Store the IP address and timestamp in Firebase
      4. .catch() // Error handling
      
    M in firebase :
      1. .orderByChild() // Check if IP already exists in the database
      2. .equalTo() // Check if IP already exists in the database
      3. .once() // Fetch and display the number of unique IPs
      4. .numChildren() // Fetch and display the number of unique IPs
      5. .update() // Update the timestamp if IP exists
      6. .push() // Store new IP with timestamp
      7. .orderByChild() // Check if IP already exists in the database
      8. .equalTo() // Check if IP already exists in the database
      9. .once() // Fetch and display the number of unique IPs
  */
  // Fetch user's IP address and store it in Firebase
  // fetch ipify API to get the IP address
  fetch('https://api.ipify.org/?format=json')
    .then(response => response.json()) // Parse the JSON response (eg {"ip":"xxx.xxx.xxx.xxx"})
    .then(data => { // Store the IP address and timestamp in Firebase
      const userIP = data.ip;
      const timestamp = new Date().toISOString();

      // Check if IP already exists in the database
      const ipRef = database.ref('loginAttempts').orderByChild('ip').equalTo(userIP);
      ipRef.once('value', snapshot => { // Check if IP exists in the database in the past.
        if (snapshot.exists()) {   // Update the timestamp if IP exists
          const key = Object.keys(snapshot.val())[0];
          database.ref('loginAttempts/' + key).update({ timestamp: timestamp });
        } 
        else {    // Store new IP with timestamp
          database.ref('loginAttempts').push({
            ip: userIP,
            timestamp: timestamp
          });
        }
      });

      // Fetch and display the number of unique IPs
      database.ref('loginAttempts').once('value', snapshot => {
        const uniqueIPs = snapshot.numChildren();
        userCountDiv.textContent = `Number of unique users: ${uniqueIPs}`;
      });
    })
    .catch((error) => {
      console.error("Error fetching IP address:", error);
    });
  
  //>>>>>>>>>>>

  


  //>>>>>>>>>>>
  /* Handle form submission of login and sign up forms using the Firebase Authentication API
     > Sign in with email and password or log in with email and password depending on the value of isLogin
     > Create a new user with email and password if isLogin is false 
     M in firebase : 
      1.Sign in with email and password // .signInWithEmailAndPassword(email, password)
      2.Create a new user with email and password // .createUserWithEmailAndPassword(email, password)
    M in js :
      1. addEventListener() // .addEventListener("submit", (e) => {})
      2. e.preventDefault() // Prevent the default form submission ( eg. page reload )
      3. Get email and password from the form login and sign up forms // const email = document.getElementById("email").value; const password = document.getElementById("password").value;
    M in this code:
      1.userCredential.user // Get the user object from the userCredential object
  */
  authForm.addEventListener("submit", (e) => { //M in js: Sign in with email and password
    e.preventDefault();
    // Get email and password from the form login and sign up forms
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isLogin) { // Login if isLogin is true
      auth.signInWithEmailAndPassword(email, password) // //M in firebase : Sign in with email and password
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Logged in as:", user.email);
          alert("Login successful!");
          // Redirect after alert to prevent double alert
          window.location.href = "user.html"; // Example redirection after successful login
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          errorMessageDiv.textContent = "Login failed: " + errorMessage;
        });
    } else {
      auth.createUserWithEmailAndPassword(email, password) //M in firebase : Create a new user with email and password
        .then((userCredential) => { 
          const user = userCredential.user;
          console.log("Account created for:", user.email);
          alert("Account creation successful!");
          // Redirect after alert to prevent double alert
          window.location.href = "user.html"; // Example redirection after successful account creation
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          errorMessageDiv.textContent = "Account creation failed: " + errorMessage;
        });
    }
  });
  //>>>>>>>>>>>
