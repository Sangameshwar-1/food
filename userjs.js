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

window.onload = function() {
    // Check authentication state when page loads
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is logged in
            document.getElementById("user-info").innerText = `Logged in as: ${user.email}`;
            
            try {
                // Check if user is authorized
                const allowedEmails = await fetchAllowedEmails();
                if (!allowedEmails.includes(user.email)) {
                    // Hide View Donors button for unauthorized users
                    document.getElementById('viewDonorsButton').style.display = 'none';
                } else {
                    // Enable View Donors button for authorized users
                    document.getElementById('viewDonorsButton').style.display = 'inline-block';
                }
                
                // Track IP address
                getAndPushIP();
                
                // Set up form event listeners
                setupEventListeners();
                
            } catch (error) {
                console.error('Error during initialization:', error);
                alert('Error during initialization. Please try again.');
            }
        } else {
            // User is not logged in, redirect to login page
            window.location.href = 'index.html';
        }
    });
};

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

// Set up event listeners for forms and buttons
function setupEventListeners() {
    // Donor form submission
    document.addEventListener('submit', function(event) {
        if (event.target.id === 'donorForm') {
            event.preventDefault();
            handleDonorFormSubmit(event);
        }
        
        if (event.target.id === 'editDonorForm') {
            event.preventDefault();
            const donorKey = event.target.dataset.donorKey;
            updateDonorDetails(donorKey);
        }
        
        if (event.target.id === 'rateForm') {
            event.preventDefault();
            handleRatingFormSubmit(event);
        }
    });
    
    // View Donors button
    document.getElementById('viewDonorsButton').addEventListener('click', () => {
        window.location.href = 'list.html';
    });
    
    // Logout button
    document.getElementById('logoutButton').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
}

// Handle donor form submission
async function handleDonorFormSubmit(event) {
    const form = event.target;
    const contact = form.querySelector('#contact').value;
    
    try {
        // Check if donor already exists
        const donorExists = await checkDonorExists(contact);
        
        if (donorExists) {
            // Show view/edit options for existing donor
            showDonorViewEditOptions(contact);
        } else {
            // Register new donor
            await registerNewDonor(form);
            alert('Donor added successfully!');
            form.reset();
        }
    } catch (error) {
        console.error('Error handling donor form:', error);
        alert('Error processing donor information: ' + error.message);
    }
}

// Check if donor exists in database
function checkDonorExists(contact) {
    return new Promise((resolve, reject) => {
        database.ref('donors').orderByChild('contact').equalTo(contact).once('value')
            .then(snapshot => {
                resolve(snapshot.exists());
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Show view/edit options for existing donor
function showDonorViewEditOptions(contact) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <h2>Donor Already Exists</h2>
        <p>A donor with this contact number is already registered.</p>
        <button onclick="viewDonorDetails('${contact}')" class="adddonor">View Details</button>
        <button onclick="editDonorDetails('${contact}')" class="adddonor">Edit Details</button>
        <button onclick="goBack()" class="adddonor">Go Back</button>
    `;
}

// View donor details
function viewDonorDetails(contact) {
    database.ref('donors').orderByChild('contact').equalTo(contact).once('value')
        .then(snapshot => {
            const donorData = snapshot.val();
            const donorKey = Object.keys(donorData)[0];
            const donor = donorData[donorKey];
            
            const container = document.querySelector('.container');
            container.innerHTML = `
                <h2>Donor Details</h2>
                <p><strong>Name:</strong> ${donor.name}</p>
                <p><strong>Blood Type:</strong> ${donor.bloodType}</p>
                <p><strong>Contact:</strong> ${donor.contact}</p>
                <p><strong>District:</strong> ${donor.district}</p>
                <button onclick="goBack()" class="adddonor">Go Back</button>
            `;
        })
        .catch(error => {
            console.error('Error fetching donor details:', error);
            alert('Error loading donor details');
        });
}

// Edit donor details
function editDonorDetails(contact) {
    database.ref('donors').orderByChild('contact').equalTo(contact).once('value')
        .then(snapshot => {
            const donorData = snapshot.val();
            const donorKey = Object.keys(donorData)[0];
            const donor = donorData[donorKey];
            
            const container = document.querySelector('.container');
            container.innerHTML = `
                <h2>Edit Donor Details</h2>
                <form id="editDonorForm" data-donor-key="${donorKey}">
                    <input type="text" id="editName" value="${donor.name}" required>
                    <input type="date" id="editDob" value="${donor.dob}" required>
                    <input type="number" id="editWeight" value="${donor.weight}" min="40" required>
                    <select id="editBloodType" required>
                        ${generateBloodTypeOptions(donor.bloodType)}
                    </select>
                    <input type="text" id="editContact" value="${donor.contact}" required readonly>
                    <input type="text" id="editAddress" value="${donor.address}" required>
                    <input type="text" id="editDistrict" value="${donor.district}" required>
                    <button type="submit" class="adddonor">Update Donor</button>
                    <button type="button" onclick="goBack()" class="adddonor">Cancel</button>
                </form>
            `;
        })
        .catch(error => {
            console.error('Error fetching donor details:', error);
            alert('Error loading donor details');
        });
}

// Generate blood type options for select element
function generateBloodTypeOptions(selectedType) {
    const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return types.map(type => 
        `<option value="${type}" ${type === selectedType ? 'selected' : ''}>${type}</option>`
    ).join('');
}

// Update donor details in Firebase
function updateDonorDetails(donorKey) {
    const updates = {
        name: document.getElementById('editName').value,
        dob: document.getElementById('editDob').value,
        weight: document.getElementById('editWeight').value,
        bloodType: document.getElementById('editBloodType').value,
        address: document.getElementById('editAddress').value,
        district: document.getElementById('editDistrict').value,
        lastUpdated: new Date().toISOString()
    };
    
    database.ref('donors').child(donorKey).update(updates)
        .then(() => {
            alert('Donor details updated successfully!');
            goBack();
        })
        .catch(error => {
            console.error('Error updating donor:', error);
            alert('Error updating donor details');
        });
}

// Register new donor
async function registerNewDonor(form) {
    const donorData = {
        name: form.querySelector('#name').value,
        dob: form.querySelector('#dob').value,
        weight: form.querySelector('#weight').value,
        bloodType: form.querySelector('#bloodType').value,
        contact: form.querySelector('#contact').value,
        address: form.querySelector('#address').value,
        district: form.querySelector('#district').value,
        lat: lat,
        lng: lng,
        timestamp: new Date().toISOString()
    };
    
    // Validate weight
    if (donorData.weight < 40) {
        throw new Error('Minimum weight for donation is 40kg');
    }
    
    // Add to Firebase
    await database.ref('donors').push(donorData);
    
    // Upload to Google Sheets
    await uploadToSpreadsheet({
        Name: donorData.name,
        "Date of Birth": donorData.dob,
        "Weight (kg)": donorData.weight,
        "Mobile No": donorData.contact,
        Address: donorData.address,
        "Blood Group": donorData.bloodType,
        District: donorData.district,
        "Coordinates": `${donorData.lat}, ${donorData.lng}`,
        "Date Added": new Date().toLocaleString()
    });
}

// Handle rating form submission
function handleRatingFormSubmit(event) {
    const form = event.target;
    const rating = form.querySelector('#rating').value;
    const feedback = form.querySelector('#feedback').value;
    
    // Save rating to Firebase
    database.ref('ratings').push({
        rating: rating,
        feedback: feedback,
        timestamp: new Date().toISOString()
    })
    .then(() => {
        alert('Thank you for your feedback!');
        form.reset();
    })
    .catch(error => {
        console.error('Error saving rating:', error);
        alert('Error submitting feedback');
    });
}

// Get and push IP address to Firebase
function getAndPushIP() {
    fetch('https://ipinfo.io/json')
        .then(response => response.json())
        .then(data => {
            const userIP = data.ip;
            const ipRef = database.ref('viewerIPs');

            ipRef.orderByChild('ip').equalTo(userIP).once('value', snapshot => {
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        ipRef.child(childSnapshot.key).update({
                            timestamp: formatDate(new Date())
                        });
                    });
                } else {
                    ipRef.push({
                        ip: userIP,
                        timestamp: formatDate(new Date())
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error fetching IP address:', error);
        });
}

// Format date for display
function formatDate(date) {
    return date.toLocaleString();
}

// Get current coordinates
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

// Upload data to Google Spreadsheet
function uploadToSpreadsheet(data) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyQmqeF5tvpivhTT0YDKGFDdq3a7Vkyr1CslCg7wZHt23k4_kHQHRBY6xtg1cejYn1y/exec';
    fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams(data),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .catch(error => {
        console.error('Error uploading to spreadsheet:', error);
    });
}

// Go back to previous view
function goBack() {
    const container = document.querySelector('.container');
    container.style.opacity = 0;
    setTimeout(() => {
        location.reload();
    }, 300);
}