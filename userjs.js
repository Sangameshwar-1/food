    // Firebase configuration
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
 
 // user-info           
            auth.onAuthStateChanged(user => {
                if (user) {
                    document.getElementById("user-info").innerText = `Logged in as: ${user.email}`;
                } else {
                    document.getElementById("user-info").innerText = "Not logged in";
                }
            });


   //>>>>>>>>
   /*
      M in js :
        1. window.onload // Check if the user is authenticated
        2. fetch() // Fetch the IP address from ipinfo.io
        3. .then() // Process the fetched IP address
        4. .catch() // Handle errors
        5. window.location.href // Redirect to index.html

      M in firebase :
        1. onAuthStateChanged() // Check if the user is authenticated
      
   */
    window.onload = function() {
      auth.onAuthStateChanged((user) => {
        if (user) { // User is authenticated checked by auth.onAuthStateChanged()
          // User is authenticated
          getAndPushIP(); //function call to Get and push the IP address to Firebase
        }
         else { // User is not authenticated, redirect to index.html
            window.location.href = 'index.html';
        }
      });
    };
    //>>>>>>>>>>>
    //>>>>>>>>>
    /*
      M in js :
        1. fetch() // Fetch the IP address from ipinfo.io
        2. .then() // Process the fetched IP address
        3. .catch() // Handle errors
        4. console.log() // Log the fetched IP
        5. .ref
      M in firebase :
        1. .ref() // Reference to the viewerIPs node ; eg: database.ref('viewerIPs')
        2. .orderByChild() // Order the IP addresses by the child node 'ip' ; eg: ipRef.orderByChild('ip').equalTo(userIP)
        3. .once() // Check if the IP address exists in Firebase ; eg: ipRef.orderByChild('ip').equalTo(userIP).once('value', snapshot => {})
        4. .forEach() // Loop through the IP addresses ; eg: snapshot.forEach(childSnapshot => {})
        5. .child() // Reference to the child node ; eg: \
        6. .update() // Update the timestamp of the existing IP address
        7. .push() // Push the new IP address to Firebase
        8. .exists() // Check if the snapshot exists
        9. .forEach() // Loop through the snapshot
    */
    function getAndPushIP() {
      fetch('https://ipinfo.io/json')  // Using ipinfo.io
        .then(response => response.json())
        .then(data => {
          const userIP = data.ip;
          console.log('Fetched IP Address:', userIP);  // Debugging: Log the fetched IP

          const ipRef = database.ref('viewerIPs');

          // Checking if the IP already exists in Firebase
          ipRef.orderByChild('ip').equalTo(userIP).once('value', snapshot => { // Check if the IP address exists in Firebase
            if (snapshot.exists()) { // Update the timestamp if IP exists
              snapshot.forEach(childSnapshot => { // Loop through the IP addresses
                const childKey = childSnapshot.key; // Reference to the child node
                ipRef.child(childKey).update({  // Update the timestamp of the existing IP address
                  timestamp /*key */ : formatDate(new Date()) // Use formatted local date and time
                }).then(() => {
                  console.log('Timestamp updated for existing IP address!');
                }).catch(error => {
                  console.error('Error updating timestamp:', error);
                });
              });
            }
             else { // Push the new IP address to Firebase
              ipRef.push({  
                ip: userIP,
                timestamp: formatDate(new Date()) // Use formatted local date and time
              }).then(() => {
                console.log('IP address pushed to Firebase successfully!');
              }).catch(error => {
                console.error('Error pushing IP address to Firebase:', error);
              });
            }
          });
        })
        .catch(error => {
          console.error('Error fetching IP address:', error);
        });
    }
    //>>>>>>>>>

    //>>>>>>>>>
    // Function to format date and time
    function formatDate(date) {
      return date.toLocaleString();
    }
    //>>>>>>>>>

    //>>>>>>>>>
    // view list
    document.getElementById('viewDonorsButton').addEventListener('click', () => {
      window.location.href = 'list.html'; // Redirect to list.html
    });
    //>>>>>>>>>

    //>>>>>>>>>
    /*
      M in firebase :
        1. .ref() // Reference to the donors node ; eg: database.ref('donors')
        2. .push() // Push the donor details to Firebase ; eg: database.ref('donors').push({})
        3. .signOut() // Sign out the user ; eg: auth.signOut()
    */
    // logout
    document.getElementById('logoutButton').addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Error signing out:', error);
      });
    });
    //>>>>>>>>>

    //>>>>>>>>>
    /*
        M in firebase :
          1. .push() // Push the donor details to Firebase ; eg: database.ref('donors').push({})

    */
    // Add donor
    document.getElementById('donorForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const bloodType = document.getElementById('bloodType').value;
      const contact = document.getElementById('contact').value;
      const address = document.getElementById('address').value;
      const district = document.getElementById('district').value;

      try {
        // Add donor details to Firebase
        await database.ref('donors').push({
          name,
          bloodType,
          contact,
          address,
          district
        });

        alert('Donor added successfully!');
        document.getElementById('donorForm').reset();
        // Upload data to Google Spreadsheet
        uploadToSpreadsheet({
          Name: name,
          "Mobile No": contact,
          Address: address,
          Group: bloodType,
          District: district
        });
      } catch (error) {
        console.error('Error adding donor:', error);
      }
    });
    //>>>>>>>>>


    //>>>>>>>>>
    // Redirect to list.html on button click
    document.getElementById('viewDonorsButton').addEventListener('click', () => {
      window.location.href = 'list.html';
    });
    //>>>>>>>>>


    //>>>>>>>>>
    /*
        M in firebase :
          
          2. .signOut() // Sign out the user ; eg: auth.signOut()
    */
    // Logout functionality
    document.getElementById('logoutButton').addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Error signing out:', error);
      });
    });
    //>>>>>>>>>


    //>>>>>>>>>
    // Function to upload data to Google Spreadsheet
    function uploadToSpreadsheet(data) {
      const scriptURL = 'https://script.google.com/macros/s/AKfycbyQmqeF5tvpivhTT0YDKGFDdq3a7Vkyr1CslCg7wZHt23k4_kHQHRBY6xtg1cejYn1y/exec';
      fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', response);
        })
        .catch(error => {
          console.error('Error:', error);
        });

    }
    //>>>>>>>>>
  
