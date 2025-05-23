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
    
    // fecth
    async function fetchAllowedEmails() {
  try {
    const response = await fetch('allowed_users.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const data = await response.json();
    
    // Debugging: log the fetched data
    console.log('Fetched allowed emails:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // Instead of throwing, return an empty array to avoid breaking the flow
    return [];
  }
}

// Usage in auth state listener



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
      auth.onAuthStateChanged(async (user) => {
        if (user) { // User is authenticated checked by auth.onAuthStateChanged()
          // User is authenticated
            const userInfoElem = document.getElementById("user-info");
            if (userInfoElem) {
              userInfoElem.innerText = "Logged in as: " + user.email;
            }
            
          getAndPushIP(); //function call to Get and push the IP address to Firebase
         
            console.log('User logged in:', user.email);
            try {
            const allowedEmails = await fetchAllowedEmails();
            console.log('Checking access for:', user.email);
            
            if (allowedEmails.includes(user.email)) {
                console.log('Access granted');
                // Create button if it doesn't exist
                if (!document.getElementById('viewDonorsButton')) {
                const button = document.createElement('button');
                button.textContent = 'View Donors';
                button.id = 'viewDonorsButton';
                button.addEventListener('click', () => {
                    window.location.href = 'list.html';
                });
                const listjElem = document.getElementById('listj');
                if (listjElem) {
                    listjElem.appendChild(button);
                } else {
                    console.error('Element with id "listj" not found.');
                }    }
            } else {
                console.log('Access denied - email not in allowed list');
                // Optionally: redirect to unauthorized page
                // window.location.href = 'unauthorized.html';
            }
            } catch (error) {
            console.error('Error checking access:', error);
            alert('Error verifying access. Please try again.');
            }
        } else {
            console.log('No user logged in');
            document.getElementById("user-info").innerText = "Not logged in";
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
    /*
      M in firebase :
        1. .ref() // Reference to the donors node ; eg: database.ref('donors')
        2. .push() // Push the donor details to Firebase ; eg: database.ref('donors').push({})
        3. .signOut() // Sign out the user ; eg: auth.signOut()
    */
    // logout
    // (Removed duplicate logout event listener to avoid conflicts)
    //>>>>>>>>>

    //>>>>>>>>>
    /*
        M in firebase :
          1. .push() // Push the donor details to Firebase ; eg: database.ref('donors').push({})

    */
    // Add donor
  // Replace the direct event listener with this:
document.addEventListener('DOMContentLoaded', function() {
  // Use event delegation for the donor form
  document.body.addEventListener('submit', function(event) {
    if (event.target.id === 'donorForm') {
      event.preventDefault();
      handleDonorFormSubmit(event);
    }
  });
});

async function handleDonorFormSubmit(event) {
  const form = event.target;
  const name = form.querySelector('#name').value;
  const dob = form.querySelector('#dob').value;
  const weight = form.querySelector('#weight').value;
  const bloodType = form.querySelector('#bloodType').value;
  const contact = form.querySelector('#contact').value;
  const address = form.querySelector('#address').value;
  const district = form.querySelector('#district').value;

  // Basic validation
  if (weight < 40) {
    alert('Minimum weight for donation is 40kg');
    return;
  }

  try {
    // Add donor details to Firebase
    await database.ref('donors').push({
      name,
      dob,
      weight,
      bloodType,
      contact,
      address,
      district,
      lat,
      lng,
      timestamp: new Date().toISOString()
    });

    alert('Donor added successfully!');
    form.reset();
    
    // Upload data to Google Spreadsheet
    uploadToSpreadsheet({
      Name: name,
      "Date of Birth": dob,
      "Weight (kg)": weight,
      "Mobile No": contact,
      Address: address,
      "Blood Group": bloodType,
      District: district,
      "Coordinates": `${lat}, ${lng}`,
      "Date Added": new Date().toLocaleString()
    });
  } catch (error) {
    console.error('Error adding donor:', error);
    alert('Error adding donor. Please try again.');
  }
}
    //>>>>>>>>>
    let lat, lng;
    function getCoords() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            document.getElementById("output").textContent =
              "Latitude: " + lat + ", Longitude: " + lng;
          }, function(error) {
            document.getElementById("output").textContent =
              "Error: " + error.message;
          });
        } else {
          document.getElementById("output").textContent =
            "Geolocation is not supported by this browser.";
        }
      }

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
    // Wait for page to fully load
document.addEventListener('DOMContentLoaded', function() {
  
  // Get the logout button
  const logoutButton = document.getElementById('logoutButton');
  
  // Add click event only if the button exists
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      console.log('Logout button clicked');
      // Sign out from Firebase
      firebase.auth().signOut()
        .then(function() {
          // Redirect after successful logout
          console.log('User logged out successfully');
          window.location.href = 'index.html';
        })
        .catch(function(error) {
          // Show error if logout fails
          console.error('Logout error:', error);
          alert('Logout failed. Please try again.');
        });
    });
  } else {
    console.warn('Logout button not found in the DOM.');
  }
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
  