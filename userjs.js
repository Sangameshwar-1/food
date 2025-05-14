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
  // Add rating
  document.getElementById('rateForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const rating = document.getElementById('rating').value;
    const feedback = document.getElementById('feedback').value;

    if (!rating) {
      alert('Please select a rating.');
      return;
    }

    try {
      // Push rating and feedback to Firebase
      await database.ref('ratings').push({
        rating: parseInt(rating),
        feedback: feedback || '',
        timestamp: formatDate(new Date())
      });

      alert('Thank you for your feedback!');
      document.getElementById('rateForm').reset();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  });
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
    // ... (keep all existing firebaseConfig and initialization code) ...

// Add donor form with update functionality
document.getElementById('donorForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const bloodType = document.getElementById('bloodType').value;
  const contact = document.getElementById('contact').value;
  const address = document.getElementById('address').value;
  const district = document.getElementById('district').value;
  const dob = document.getElementById('dob').value; // New field
  const weight = document.getElementById('weight').value; // New field

  try {
    // First check if donor with this contact already exists
    const donorsRef = database.ref('donors');
    const snapshot = await donorsRef.orderByChild('contact').equalTo(contact).once('value');
    
    if (snapshot.exists()) {
      // Donor exists - update their record
      const updateData = {
        name,
        bloodType,
        address,
        district,
        dob,
        weight,
        lat,
        lng,
        lastUpdated: formatDate(new Date())
      };
      
      // Get the key of the existing donor
      let donorKey;
      snapshot.forEach((childSnapshot) => {
        donorKey = childSnapshot.key;
      });
      
      await donorsRef.child(donorKey).update(updateData);
      alert('Donor information updated successfully!');
    } else {
      // New donor - create full record
      await donorsRef.push({
        name,
        bloodType,
        contact,
        address,
        district,
        dob,
        weight,
        lat,
        lng,
        dateAdded: formatDate(new Date()),
        lastUpdated: formatDate(new Date())
      });
      alert('New donor added successfully!');
      
      // Upload to Google Spreadsheet only for new donors
      uploadToSpreadsheet({
        Name: name,
        "Mobile No": contact,
        Address: address,
        Group: bloodType,
        District: district,
        "Date of Birth": dob,
        Weight: weight
      });
    }
    
    document.getElementById('donorForm').reset();
  } catch (error) {
    console.error('Error processing donor:', error);
    alert('An error occurred. Please try again.');
  }
});

// Update the navigateToDonor function to include new fields
function navigateToDonor() {
  const container = document.querySelector('.container');
  container.style.opacity = 0;
  setTimeout(() => {
    container.innerHTML = `
      <form id="donorForm">
        <button class="adddonor" onclick="goBack()">Go Back</button>
        <input type="text" id="name" placeholder="Name" required>
        <select id="bloodType" required>
          <option value="" disabled selected>Select Blood Type</option>
          <option value="A+">A+ve</option>
          <option value="A-">A-ve</option>
          <option value="B+">B+ve</option>
          <option value="B-">B-ve</option>
          <option value="AB+">AB+ve</option>
          <option value="AB-">AB-ve</option>
          <option value="O+">O+ve</option>
          <option value="O-">O-ve</option>
        </select>
        <input type="text" id="contact" placeholder="Contact Number" required>
        <input type="date" id="dob" placeholder="Date of Birth" required>
        <input type="number" id="weight" placeholder="Weight (kg)" min="40" max="150" required>
        <input type="text" id="address" placeholder="Address" required>
        <button type="button" onclick="getCoords()" class="adddonor">Get My Location</button>
        <p id="output" style="text-align: center; font-size: 0.9em; color: #555;"></p>
        <input type="text" id="district" placeholder="District" required>
        <button type="submit" class="adddonor">Submit Donor Info</button>
      </form>
      <div class="scrolling-text" style="background-color:white; color: black; font-weight: bold; overflow: hidden; white-space: nowrap;margin-top:1;">
        <h3 style="color: red; display: inline;">**</h3>
        <h3 style="display: inline;">Rate this web below</h3>
        <h3 style="color: red; display: inline;">**</h3>
      </div>
      <p class="warning">** The RH factor and the District must be correct.</p>
      <style>
        .scrolling-text {
          animation: scroll-left 10s linear infinite;
        }
        @keyframes scroll-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      </style>
    `;
    container.style.opacity = 1;
    
    // Add event listener to check for existing donor when contact is entered
    document.getElementById('contact').addEventListener('blur', async function() {
      const contact = this.value;
      if (contact) {
        const snapshot = await database.ref('donors').orderByChild('contact').equalTo(contact).once('value');
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const donor = childSnapshot.val();
            // Auto-fill the form with existing data
            document.getElementById('name').value = donor.name || '';
            document.getElementById('bloodType').value = donor.bloodType || '';
            document.getElementById('address').value = donor.address || '';
            document.getElementById('district').value = donor.district || '';
            document.getElementById('dob').value = donor.dob || '';
            document.getElementById('weight').value = donor.weight || '';
            
            if (donor.lat && donor.lng) {
              lat = donor.lat;
              lng = donor.lng;
              document.getElementById("output").textContent = 
                `Using existing location: Latitude: ${lat}, Longitude: ${lng}`;
            }
          });
          alert('Existing donor found. You can update the information.');
        }
      }
    });
  }, 300);
}

// ... (keep all other existing code) ...
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
  
