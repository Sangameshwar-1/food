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

  let isLogin = true;

  toggleLink.addEventListener("click", () => {
    loginContainer.classList.add('fade-out');

    setTimeout(() => {
      isLogin = !isLogin;
      if (isLogin) {
        formTitle.textContent = "Login Page";
        authButton.textContent = "Login";
        toggleLink.textContent = "Don't have an account? Sign up";
      } else {
        formTitle.textContent = "Sign Up Page";
        authButton.textContent = "Sign Up";
        toggleLink.textContent = "Already have an account? Login";
      }
      errorMessageDiv.textContent = "";

      loginContainer.classList.remove('fade-out');
      loginContainer.classList.add('fade-in');
    }, 500); // Match the duration of the fadeOut animation
  });

  resetLink.addEventListener("click", () => {
    const email = prompt("Please enter your email address:");
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Password reset email sent!");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                errorMessageDiv.textContent = "Error sending password reset email: " + errorMessage;
                errorMessageDiv.style.display = "block";
            });
    } else {
        alert("Please enter a valid email address.");
    }
  });

  // Fetch user's IP address and store it in Firebase
  fetch('https://api.ipify.org/?format=json')
    .then(response => response.json())
    .then(data => {
      const userIP = data.ip;
      const timestamp = new Date().toISOString();

      // Check if IP already exists in the database
      const ipRef = database.ref('loginAttempts').orderByChild('ip').equalTo(userIP);
      ipRef.once('value', snapshot => {
        if (snapshot.exists()) {
          // Update the timestamp if IP exists
          const key = Object.keys(snapshot.val())[0];
          database.ref('loginAttempts/' + key).update({ timestamp: timestamp });
        } else {
          // Store new IP with timestamp
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

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isLogin) {
      auth.signInWithEmailAndPassword(email, password)
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
      auth.createUserWithEmailAndPassword(email, password)
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
