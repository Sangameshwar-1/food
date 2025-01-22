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
`   
    window.onload = function() {
      auth.onAuthStateChanged((user) => {
        if (user) {
          // User is authenticated
          getAndPushIP();
        } else {
          // User is not authenticated, redirect to index.html
          window.location.href = 'index.html';
        }
      });
    };

    function getAndPushIP() {
      fetch('https://ipinfo.io/json')  // Using ipinfo.io
        .then(response => response.json())
        .then(data => {
          const userIP = data.ip;
          console.log('Fetched IP Address:', userIP);  // Debugging: Log the fetched IP

          const ipRef = database.ref('viewerIPs');

          // Checking if the IP already exists in Firebase
          ipRef.orderByChild('ip').equalTo(userIP).once('value', snapshot => {
            if (snapshot.exists()) {
              snapshot.forEach(childSnapshot => {
                const childKey = childSnapshot.key;
                ipRef.child(childKey).update({
                  timestamp: formatDate(new Date()) // Use formatted local date and time
                }).then(() => {
                  console.log('Timestamp updated for existing IP address!');
                }).catch(error => {
                  console.error('Error updating timestamp:', error);
                });
              });
            } else {
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

    // Function to format date and time
    function formatDate(date) {
      return date.toLocaleString();
    }

    // view list
    document.getElementById('viewDonorsButton').addEventListener('click', () => {
      window.location.href = 'list.html';
    });

    // logout
    document.getElementById('logoutButton').addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Error signing out:', error);
      });
    });

    // Add donor
    document.getElementById('donorForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const bloodType = document.getElementById('bloodType').value;
      const contact = document.getElementById('contact').value;
      const address = document.getElementById('address').value;
      const district = document.getElementById('district').value;

      try {
        await database.ref('donors').push({
          name,
          bloodType,
          contact,
          address,
          district
        });

        alert('Donor added successfully!');
        document.getElementById('donorForm').reset();
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

    // Redirect to list.html on button click
    document.getElementById('viewDonorsButton').addEventListener('click', () => {
      window.location.href = 'list.html';
    });

    // Logout functionality
    document.getElementById('logoutButton').addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Error signing out:', error);
      });
    });

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
    
