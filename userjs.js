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

// Global variables
let lat, lng;
let existdonor;
window.onload = function() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            document.getElementById("user-info").innerText = `Logged in as: ${user.email}`;
            
            try {
                const allowedEmails = await fetchAllowedEmails();
                if (!allowedEmails.includes(user.email)) {
                    document.getElementById('viewDonorsButton').style.display = 'none';
                } else {
                    document.getElementById('viewDonorsButton').style.display = 'inline-block';
                }
                
                getAndPushIP();
                
                // Properly handle the promise
                const isExistingDonor = await checkExistingDonor(user.email);
                if (isExistingDonor) {
                    // This should be handled in the checkExistingDonor function
                    // Or you can redirect here if needed
                    navigateToDonor();
                } else {
                    navigateToeditdonor();
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                alert('Error during initialization. Please try again.');
            }
        } else {
            window.location.href = 'index.html';
        }
    });
};

// donor or not 
async function checkExistingDonor(email) {
    try {
        const donorsRef = database.ref('donors');
        const snapshot = await donorsRef.orderByChild('email').equalTo(email).once('value');
        
        if (snapshot.exists()) {
            return true; // Donor exists
        }
        return false; // Donor does not exist
    } catch (error) {
        console.error('Error checking existing donor:', error);
        return false; // Return false in case of an error
    }
}


// Fetch allowed emails from JSON file
async function fetchAllowedEmails() {
    try {
        const response = await fetch('allowed_users.json');
        if (!response.ok) throw new Error('Network response not ok');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        return data;
    } catch (error) {
        console.error('Error fetching allowed users:', error);
        throw error;
    }
}

function navigateToDonor() {
    const container = document.querySelector('.container');
    container.style.opacity = 0;
    setTimeout(() => {
        container.innerHTML = `
            <form id="donorForm">
                <button type="button" class="adddonor" onclick="goBack()">Go Back</button>
                <input type="text" id="name" placeholder="Name" required>
                <input type="date" id="dob" placeholder="Date of Birth" required>
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
            <div class="scrolling-text">
                <h3 style="color: red; display: inline;">**</h3>
                <h3 style="display: inline;">Rate this web below</h3>
                <h3 style="color: red; display: inline;">**</h3>
            </div>
            <p class="warning">** The RH factor and the District must be correct.</p>
        `;
        container.style.opacity = 1;
        
        // Add event listener for form submission
        document.getElementById('donorForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const dob = document.getElementById('dob').value;
            const weight = document.getElementById('weight').value;
            const bloodType = document.getElementById('bloodType').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const district = document.getElementById('district').value;
            
            await submitToFirebase(name, dob, weight, bloodType, contact, address, district);
        });
    }, 300);
}
// navigate to edit donor
function navigateToeditdonor() {
    const container = document.querySelector('.container');
    container.style.opacity = 0;
    setTimeout(() => {
        container.innerHTML = `
            <h1>Donor Information</h1>
            <div id="donorDetails">
                <p><strong>Name:</strong> <span id="displayName">John Doe</span></p>
                <p><strong>Date of Birth:</strong> <span id="displayDob">1990-01-01</span></p>
                <p><strong>Weight:</strong> <span id="displayWeight">70 kg</span></p>
                <p><strong>Blood Type:</strong> <span id="displayBloodType">O+</span></p>
                <p><strong>Contact:</strong> <span id="displayContact">1234567890</span></p>
                <p><strong>Address:</strong> <span id="displayAddress">123 Main St</span></p>
                <p><strong>District:</strong> <span id="displayDistrict">Sample District</span></p>
                <button class="adddonor" id="editButton" style="margin-top: 10px;">Edit Information</button>
            </div>
            <form id="editDonorForm" style="display: none; margin-top: 20px;">
                <input type="text" id="editName" placeholder="Name" required>
                <input type="date" id="editDob" placeholder="Date of Birth" required>
                <input type="number" id="editWeight" placeholder="Weight (kg)" min="40" required>
                <select id="editBloodType" required>
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
                <input type="text" id="editContact" placeholder="Contact Number" required>
                <input type="text" id="editAddress" placeholder="Address" required>
                <button type="button" onclick="getCoords()" class="adddonor">Get My Location</button>
                <p id="output" style="text-align: center; font-size: 0.9em; color: #555;"></p>
                <input type="text" id="editDistrict" placeholder="District" required>
                <button type="submit" class="adddonor">Update Donor</button>
            </form>
        `;
        container.style.opacity = 1;

        // Add event listener to toggle edit form
        document.getElementById('editButton').addEventListener('click', () => {
            document.getElementById('donorDetails').style.display = 'none';
            document.getElementById('editDonorForm').style.display = 'block';
        });

        // Fetch and display user details dynamically
        fetchDonorDetails();
        // edit donor 
        document.getElementById('editDonorForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const donorId = new URLSearchParams(window.location.search).get('donorId');
            const updatedData = {
                name: document.getElementById('editName').value,
                dob: document.getElementById('editDob').value,
                weight: document.getElementById('editWeight').value,
                bloodType: document.getElementById('editBloodType').value,
                contact: document.getElementById('editContact').value,
                address: document.getElementById('editAddress').value,
                district: document.getElementById('editDistrict').value
            };
            await updateDonorDetails(donorId, updatedData);
        });
    }, 300);
}

async function fetchDonorDetails() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const donorsRef = database.ref('donors');
        const snapshot = await donorsRef.orderByChild('email').equalTo(user.email).once('value');

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const donorData = childSnapshot.val();
                document.getElementById('displayName').innerText = donorData.name || 'N/A';
                document.getElementById('displayDob').innerText = donorData.dob || 'N/A';
                document.getElementById('displayWeight').innerText = donorData.weight ? `${donorData.weight} kg` : 'N/A';
                document.getElementById('displayBloodType').innerText = donorData.bloodType || 'N/A';
                document.getElementById('displayContact').innerText = donorData.contact || 'N/A';
                document.getElementById('displayAddress').innerText = donorData.address || 'N/A';
                document.getElementById('displayDistrict').innerText = donorData.district || 'N/A';
            });
        } else {
            console.error('No donor details found for the current user.');
        }
    } catch (error) {
        console.error('Error fetching donor details:', error);
    }
}
//
// Function to update donor details
async function updateDonorDetails(donorId, updatedData) {
    try {
        const donorRef = database.ref(`donors/${donorId}`);
        await donorRef.update(updatedData);
        alert('Donor details updated successfully!');
        location.reload(); // Reload the page to reflect updated details
    } catch (error) {
        console.error('Error updating donor details:', error);
        alert('Failed to update donor details. Please try again.');
    }
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

function toggleDark() {
    document.body.classList.toggle('dark-mode');
    const toggleBtn = document.querySelector('.toggle');
    toggleBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}

function goBack() {
    const container = document.querySelector('.container');
    container.style.opacity = 0;
    setTimeout(() => {
        location.reload();
    }, 300);
}

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
// event listeners to submit forms adddonor
document.addEventListener('DOMContentLoaded', () => {
    const donorForm = document.getElementById('donorForm');
    const volunteerForm = document.getElementById('volunteerForm');

    if (donorForm) {
        donorForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const dob = document.getElementById('dob').value;
            const weight = document.getElementById('weight').value;
            const bloodType = document.getElementById('bloodType').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const district = document.getElementById('district').value;

            // Simple validation before submitting
            if (!name || !dob || !weight || !bloodType || !contact || !address || !district) {
                alert("Please fill all fields.");
                return;
            }

            // Call the function to submit the form to Firebase
            await submitToFirebase(name, dob, weight, bloodType, contact, address, district);
        });
    } else {
        console.log("Donor form not found");
    }

    if (volunteerForm) {
        volunteerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('volunteerName').value;
            const email = document.getElementById('volunteerEmail').value;
            const contact = document.getElementById('volunteerContact').value;
            const address = document.getElementById('volunteerAddress').value;
            const district = document.getElementById('volunteerDistrict').value;
            const skills = document.getElementById('volunteerSkills').value;
            // Simple validation before submitting
            if (!name || !email || !contact || !address || !district || !skills) {
                alert("Please fill all fields.");
                return;
            }
            // Call the function to submit the form to Firebase
            await submitVolunteerToFirebase(name, email, contact, address, district, skills);
        }
        );  
    }
    else {
        console.log("Volunteer form not found");
    }
}
);
// Function to submit donor data to Firebase
async function submitToFirebase(name, dob, weight, bloodType, contact, address, district) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const donorData = {
            name,
            dob,
            weight,
            bloodType,
            contact,
            address,
            district,
            email: user.email
        };

        // Push donor data to Firebase
        await database.ref('donors').push(donorData);
        alert('Donor data submitted successfully!');
        location.reload(); // Reload the page to reflect changes
    } catch (error) {
        console.error('Error submitting donor data:', error);
        alert('Failed to submit donor data. Please try again.');
    }
}
// Function to submit volunteer data to Firebase
async function submitVolunteerToFirebase(name, email, contact, address, district, skills) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const volunteerData = {
            name,
            email,
            contact,
            address,
            district,
            skills
        };

        // Push volunteer data to Firebase
        await database.ref('volunteers').push(volunteerData);
        alert('Volunteer data submitted successfully!');
        location.reload(); // Reload the page to reflect changes
    } catch (error) {
        console.error('Error submitting volunteer data:', error);
        alert('Failed to submit volunteer data. Please try again.');
    }
}



// logout 
document.getElementById('logoutButton').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});