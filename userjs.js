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
    
    // USED VARIABLES 
    let usermail = localStorage.getItem('userEmail') || '';
    let isuserallowed = localStorage.getItem('isUserAllowed') === 'true';
    let isdonorformsubmitted = localStorage.getItem('isDonorFormSubmitted') === 'true';
    let tempstoreddonorDetails = localStorage.getItem('tempStoredDonorDetails') ? JSON.parse(localStorage.getItem('tempStoredDonorDetails')) : '';
    let currentDonorKey = localStorage.getItem('currentDonorKey') || '';


    // fecth allowed users from allowed_users.json
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


    async function checkExistingSubmission(userId) {
        try {
            const snapshot = await database.ref('donors')
            .orderByChild('userId')
            .equalTo(userId)
            .once('value');
            
            return snapshot.exists();
        } catch (error) {
            console.error('Error checking submissions:', error);
            return false; // Assume no submission if error occurs
        }
    }

    // 
    window.onload = function() {
  // First try to render UI from cache
  const cachedUserEmail = localStorage.getItem('userEmail');
  if (cachedUserEmail) {
    document.getElementById("user-info").innerText = "Logged in as: " + cachedUserEmail;
    
    // Set initial UI state from cache
    const addDonorBtn = document.querySelector('.adddonor');
    if (addDonorBtn) {
      const isSubmitted = localStorage.getItem('isDonorFormSubmitted') === 'true';
      addDonorBtn.textContent = isSubmitted ? 'View Donor' : 'Add Donor';
    }
    
    const viewDonorsBtn = document.getElementById('viewDonorsButton');
    if (viewDonorsBtn) {
      viewDonorsBtn.style.display = localStorage.getItem('isUserAllowed') === 'true' ? '' : 'none';
    }
  }

  // Then proceed with actual auth check
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      localStorage.setItem("lastPage", "user.html");
      const userInfoElem = document.getElementById("user-info");
      if (userInfoElem) {
        userInfoElem.innerText = "Logged in as: " + user.email;
        usermail = user.email;
        localStorage.setItem('userEmail', user.email);
        
        // Check existing submission with cache first
        const cachedSubmission = localStorage.getItem('donorSubmission_' + user.uid);
        let existingSubmission = false;
        
        if (cachedSubmission) {
          const submissionData = JSON.parse(cachedSubmission);
          if (Date.now() - submissionData.timestamp < 3600000) { // 1 hour cache
            existingSubmission = submissionData.exists;
          }
        }
        
        if (!existingSubmission) {
          existingSubmission = await checkExistingSubmission(user.uid);
          localStorage.setItem('donorSubmission_' + user.uid, JSON.stringify({
            exists: existingSubmission,
            timestamp: Date.now()
          }));
        }

        if (existingSubmission) {
          isdonorformsubmitted = true;
          localStorage.setItem('isDonorFormSubmitted', 'true');
          const addDonorBtn = document.querySelector('.adddonor');
          if (addDonorBtn) {
            addDonorBtn.textContent = 'View Donor';
            addDonorBtn.onclick = function(e) {
              e.preventDefault();
              navtodisplay();
            };
          }
        } else {
          const addDonorBtn = document.querySelector('.adddonor');
          if (addDonorBtn) {
            addDonorBtn.textContent = 'Add Donor';
            addDonorBtn.onclick = function(e) {
              e.preventDefault();
              navigateToDonor();
            };
          }
        }

        // Check allowed emails with cache
        const cachedAllowed = localStorage.getItem('allowedEmails');
        let allowedEmails = [];
        
        if (cachedAllowed) {
          try {
            allowedEmails = JSON.parse(cachedAllowed);
            if (Date.now() - parseInt(localStorage.getItem('allowedEmailsTime') || 0) > 86400000) { // 24 hours
              allowedEmails = await fetchAllowedEmails(); // Refresh if stale
            }
          } catch (e) {
            allowedEmails = await fetchAllowedEmails();
          }
        } else {
          allowedEmails = await fetchAllowedEmails();
        }

        if (allowedEmails.includes(user.email) || 0) {
          isuserallowed = true;
          localStorage.setItem('isUserAllowed', 'true');
          let button = document.getElementById('viewDonorsButton');
          if (!button) {
            button = document.createElement('button');
            button.textContent = 'View Donors';
            button.id = 'viewDonorsButton';
            button.className = 'adddonor';
            button.onclick = () => window.location.href = 'list.html';
            const listjElem = document.getElementById('listj');
            if (listjElem) listjElem.appendChild(button);
          }
        } else {
          const button = document.getElementById('viewDonorsButton');
          if (button) button.style.display = 'none';
          localStorage.setItem('isUserAllowed', 'false');
        }

        // IP check (once per session)
        if (!localStorage.getItem('lastIPCheck') || 
            Date.now() - parseInt(localStorage.getItem('lastIPCheck')) > 86400000) {
          getAndPushIP();
          localStorage.setItem('lastIPCheck', Date.now().toString());
        }
      }
    } else {
      console.log('No user logged in');
      document.getElementById("user-info").innerText = "Not logged in";
      const button = document.getElementById('viewDonorsButton');
      if (button) button.style.display = 'none';
    }
  });
};
    
    //  PUSH IP
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
   
    // Display donor details
    
    
    //
    function navtodisplay() {
      pageHistory.push(currentPage);
      currentPage = 'donorDetails';
      
      const container = document.querySelector('.container');
      container.style.opacity = 0;
      setTimeout(async () => {
        // Your existing donor details display code
        const user = firebase.auth().currentUser;
        if (!user) {
          container.innerHTML = `
            <div class="donor-details">
              <p style="text-align:center; color:#b00;">You are not logged in.</p>
            </div>
          `;
          container.style.opacity = 1;
          return;
        }

        try {
          const snapshot = await database.ref('donors')
            .orderByChild('userId')
            .equalTo(user.uid)
            .once('value');

          if (!snapshot.exists()) {
            container.innerHTML = `
              <div class="donor-details">
                <button class="adddonor" onclick="goBack()">Go Back</button>
                <p style="text-align:center; color:#b00;">No donor details found for your account.</p>
              </div>
            `;
          } else {
            let donorHtml = '';
            snapshot.forEach(child => {
              const donor = child.val();
              currentDonorKey = child.key; // Store the key for editing
              tempstoreddonorDetails = donor;
              donorHtml += `
                <div class="donor-details" style="max-width:400px;margin:30px auto;padding:24px 28px 18px 28px;background:#fff;border-radius:12px;box-shadow:0 2px 16px #0001;">
                  <button class="adddonor" style="margin-bottom:12px;" onclick="goBack()">Go Back</button>
                  <h2 style="text-align:center;color:#d32f2f;margin-bottom:18px;">Your Donor Submission</h2>
                  <table style="width:100%;font-size:1em;color:#222;margin-bottom:16px;">
                    <tr><td style="font-weight:600;">Name:</td><td>${donor.name || ''}</td></tr>
                    <tr><td style="font-weight:600;">Date of Birth:</td><td>${donor.dob || ''}</td></tr>
                    <tr><td style="font-weight:600;">Weight:</td><td>${donor.weight || ''} kg</td></tr>
                    <tr><td style="font-weight:600;">Blood Type:</td><td>${donor.bloodType || ''}</td></tr>
                    <tr><td style="font-weight:600;">Contact:</td><td>${donor.contact || ''}</td></tr>
                    <tr><td style="font-weight:600;">Address:</td><td>${donor.address || ''}</td></tr>
                    <tr><td style="font-weight:600;">District:</td><td>${donor.district || ''}</td></tr>
                    <tr><td style="font-weight:600;">Coordinates:</td><td>${donor.lat && donor.lng ? donor.lat + ', ' + donor.lng : 'N/A'}</td></tr>
                    <tr><td style="font-weight:600;">Submitted At:</td><td>${donor.timestamp ? new Date(donor.timestamp).toLocaleString() : ''}</td></tr>
                  </table>
                  <div style="text-align:center;">
                    <button class="adddonor" style="background:#1976d2;color:#fff;padding:8px 24px;border-radius:6px;font-size:1em;" onclick="navigateToDonoredit()">Edit Submission</button>
                  </div>
                </div>
              `;
            });
            container.innerHTML = donorHtml;
          }
        } catch (error) {
          container.innerHTML = `
            <div class="donor-details">
              <button class="adddonor" onclick="goBack()">Go Back</button>
              <p style="text-align:center; color:#b00;">Error loading donor details. Please try again.</p>
            </div>
          `;
          console.error('Error displaying donor details:', error);
        }
        
        container.style.opacity = 1;
      }, 300);
    }
    // edit donor

    function navigateToDonoredit() {
      const container = document.querySelector('.container');
      container.style.opacity = 0;
      setTimeout(() => {
        container.innerHTML = `
          <form id="donorForm">
            <button type="button" class="adddonor" onclick="goBack()">Go Back</button>
            <input type="text" id="name" placeholder="Name" required>
            <!-- Date of Birth field -->
            <input type="date" id="dob" placeholder="Date of Birth" required>
            <!-- Weight field -->
            <input type="number" id="weight" placeholder="Weight (kg)" min="40" required>
            <select id="bloodType" required>
              <option value="" disabled>Select Blood Type</option>
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
            <input type="text" id="address" placeholder="Address" required>
            <button type="button" onclick="getCoords()" class="adddonor">Get My Location</button>
            <p id="output" style="text-align: center; font-size: 0.9em; color: #555;"></p>
            <input type="text" id="district" placeholder="District" required>
            <button type="submit" class="adddonor">Edit Donor</button>
          </form>
        `;
        // Pre-fill form fields with existing donor details
        if (tempstoreddonorDetails) {
          document.getElementById('name').value = tempstoreddonorDetails.name || '';
          document.getElementById('dob').value = tempstoreddonorDetails.dob || '';
          document.getElementById('weight').value = tempstoreddonorDetails.weight || '';
          document.getElementById('bloodType').value = tempstoreddonorDetails.bloodType || '';
          document.getElementById('contact').value = tempstoreddonorDetails.contact || '';
          document.getElementById('address').value = tempstoreddonorDetails.address || '';
          document.getElementById('district').value = tempstoreddonorDetails.district || '';
        }
        container.style.opacity = 1;
      }, 300);
    }
    // donor form
    let pageHistory = ['main']; // Track page navigation history
    let currentPage = 'main';   // Track current page

    // Modify your navigation functions to use history
    function navigateToDonor() {
      pageHistory.push(currentPage);
      currentPage = 'donorForm';
      
      const container = document.querySelector('.container');
      container.style.opacity = 0;
      setTimeout(() => {
        container.innerHTML = `
          <form id="donorForm">
            <button class="adddonor" onclick="goBack()">Go Back</button>
            <!-- Rest of your donor form HTML -->
            <input type="text" id="name" placeholder="Name" required>
          
          <!-- Date of Birth field -->
          <input type="date" id="dob" placeholder="Date of Birth" required>
          
          <!-- Weight field -->
          <input type="number" id="weight" placeholder="Weight (kg)" min="40" required>
          
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
          <input type="text" id="address" placeholder="Address" required>
          <button type="button" onclick="getCoords()" class="adddonor">Get My Location</button>
          <p id="output" style="text-align: center; font-size: 0.9em; color: #555;"></p>
          <input type="text" id="district" placeholder="District" required>
          <button type="submit" class="adddonor">Add Donor</button>
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
            0% {
            transform: translateX(100%);
            }
            100% {
            transform: translateX(-100%);
            }
          }
          </style>
        
        `;
        container.style.opacity = 1;
      }, 300);
    }
    
    //
    function navigateToVolunteer() {
      const container = document.querySelector('.container');
      container.style.opacity = 0;
      setTimeout(() => {
        container.innerHTML = `
        <h1>Volunteer Registration</h1>
        <button class="adddonor" onclick="goBack()" style="margin-bottom: 10px;">Go Back</button>
        <form id="volunteerForm">
          <input type="text" id="volunteerName" placeholder="Name" required>
          <input type="email" id="volunteerEmail" placeholder="Email" required>
          <input type="text" id="volunteerContact" placeholder="Contact Number" required>
          <input type="text" id="volunteerAddress" placeholder="Address" required>
          <input type="text" id="volunteerDistrict" placeholder="District" required>
          <button type="button" onclick="getCoords()" class="adddonor">Get My Location</button>
          <textarea id="volunteerSkills" placeholder="Skills/Expertise" rows="4" style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid #dfe6e9; margin-top: 10px;" required></textarea>
          <button type="submit" class="adddonor">Register as Volunteer</button>
        </form>
        `;
        container.style.opacity = 1;
      }, 300);
    }
    // 
    function goBack() {
      if (pageHistory.length === 0) {
        // If no history, just show main content
        showMainContent();
        return;
      }
      
      const previousPage = pageHistory.pop();
      currentPage = previousPage;
      
      const container = document.querySelector('.container');
      container.style.opacity = 0;
      
      setTimeout(() => {
        switch(previousPage) {
          case 'main':
            showMainContent();
            break;
          case 'donorForm':
            if (isdonorformsubmitted) {
              navtodisplay();
              navigateToVolunteer();
            } else {
              navigateToDonor();
              navigateToVolunteer()
            }
            break;
          case 'donorDetails':
            default:
            navtodisplay();
            break;
        }
        container.style.opacity = 1;
      }, 300);
    }

    // Helper function to show main content
    function showMainContent() {
      const container = document.querySelector('.container');
      container.innerHTML = `
        <h1>Donor Management System</h1>
        <div>
          <button class="adddonor" onclick="${isdonorformsubmitted ? 'navtodisplay()' : 'navigateToDonor()'}">
            ${isdonorformsubmitted ? 'View Donor' : 'Add Donor'}
          </button>
        </div>
        <div>
          <button class="adddonor" onclick="navigateToVolunteer()" style="margin-top:7px;">Volunteer</button>
        </div>
        <div class="scrolling-text" style="background-color:white; color: black; font-weight: bold; overflow: hidden; white-space: nowrap;margin-top:1;">
          <h3 style="color: red; display: inline;">**</h3>
          <h3 style="display: inline;">Rate this web below</h3>
          <h3 style="color: red; display: inline;">**</h3>
        </div>
       
        <style>
          .scrolling-text {
            animation: scroll-left 10s linear infinite;
          }
          @keyframes scroll-left {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        </style>
      `;    
     
    }

    // Update your existing functions to use this history system:
    // In your auth.onAuthStateChanged callback, replace direct DOM manipulation with:
    // (handled in onAuthStateChanged callback above)
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
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('#name').value;
    const dob = form.querySelector('#dob').value;
    const weight = form.querySelector('#weight').value;
    const bloodType = form.querySelector('#bloodType').value;
    const contact = form.querySelector('#contact').value;
    const address = form.querySelector('#address').value;
    const district = form.querySelector('#district').value;
    const user = firebase.auth().currentUser;

    // Basic validation
    if (weight < 40) {
        alert('Minimum weight for donation is 40kg');
        return;
    }

    try {
        // Check if we're editing an existing record
        if (currentDonorKey) {
            // Update the existing record
            await database.ref('donors/' + currentDonorKey).update({
                name,
                dob,
                weight,
                bloodType,
                contact,
                address,
                district,
                lat: lat || tempstoreddonorDetails.lat,
                lng: lng || tempstoreddonorDetails.lng,
                timestamp: new Date().toISOString()
            });
            
            alert('Donor details updated successfully!');
            navtodisplay(); // Return to view mode
        } else {
            // Add new donor
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
                userId: user.uid,
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
        }
    } catch (error) {
        console.error('Error processing donor:', error);
        alert('Error processing donor. Please try again.');
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
  