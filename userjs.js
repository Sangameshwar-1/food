
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

window.onload = function () {
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

                const isExistingDonor = await checkExistingDonor(user.email);
                if (isExistingDonor) {
                    navigateToeditdonor();
                } else {
                    navigateToDonor();
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                alert('Initialization failed.');
            }
        } else {
            window.location.href = 'index.html';
        }
    });
};

async function fetchAllowedEmails() {
    try {
        const response = await fetch('allowed_users.json');
        if (!response.ok) throw new Error('Failed to fetch allowed users');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching allowed users:', error);
        throw error;
    }
}

async function checkExistingDonor(email) {
    try {
        const donorsRef = database.ref('donors');
        const snapshot = await donorsRef.orderByChild('email').equalTo(email).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking donor:', error);
        return false;
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
                <input type="date" id="dob" required>
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
                <p id="output"></p>
                <input type="text" id="district" placeholder="District" required>
                <button type="submit" class="adddonor">Add Donor</button>
            </form>
        `;
        container.style.opacity = 1;

        document.getElementById('donorForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const dob = document.getElementById('dob').value;
            const weight = document.getElementById('weight').value;
            const bloodType = document.getElementById('bloodType').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const district = document.getElementById('district').value;

            const user = auth.currentUser;
            if (!user) return;

            const donorRef = database.ref('donors').push();
            await donorRef.set({
                email: user.email,
                name,
                dob,
                weight,
                bloodType,
                contact,
                address,
                district,
                latitude: lat || null,
                longitude: lng || null
            });
            alert('Donor info added.');
            navigateToeditdonor();
        });
    }, 300);
}

function navigateToeditdonor() {
    const container = document.querySelector('.container');
    container.style.opacity = 0;
    setTimeout(() => {
        container.innerHTML = `
            <h1>Donor Information</h1>
            <div id="donorDetails">
                <p><strong>Name:</strong> <span id="displayName"></span></p>
                <p><strong>Date of Birth:</strong> <span id="displayDob"></span></p>
                <p><strong>Weight:</strong> <span id="displayWeight"></span></p>
                <p><strong>Blood Type:</strong> <span id="displayBloodType"></span></p>
                <p><strong>Contact:</strong> <span id="displayContact"></span></p>
                <p><strong>Address:</strong> <span id="displayAddress"></span></p>
                <p><strong>District:</strong> <span id="displayDistrict"></span></p>
                <button class="adddonor" id="editButton">Edit Information</button>
            </div>
            <form id="editDonorForm" style="display:none;">
                <input type="text" id="editName" required>
                <input type="date" id="editDob" required>
                <input type="number" id="editWeight" min="40" required>
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
                <input type="text" id="editContact" required>
                <input type="text" id="editAddress" required>
                <button type="button" onclick="getCoords()" class="adddonor">Get My Location</button>
                <p id="output"></p>
                <input type="text" id="editDistrict" required>
                <button type="submit" class="adddonor">Update Donor</button>
            </form>
        `;
        container.style.opacity = 1;

        document.getElementById('editButton').addEventListener('click', () => {
            document.getElementById('donorDetails').style.display = 'none';
            document.getElementById('editDonorForm').style.display = 'block';
        });

        fetchDonorDetails();
    }, 300);
}

async function fetchDonorDetails() {
    const user = auth.currentUser;
    if (!user) return;

    const donorsRef = database.ref('donors');
    const snapshot = await donorsRef.orderByChild('email').equalTo(user.email).once('value');
    if (snapshot.exists()) {
        const donorId = Object.keys(snapshot.val())[0];
        const donorData = snapshot.val()[donorId];

        document.getElementById('displayName').innerText = donorData.name;
        document.getElementById('displayDob').innerText = donorData.dob;
        document.getElementById('displayWeight').innerText = donorData.weight + ' kg';
        document.getElementById('displayBloodType').innerText = donorData.bloodType;
        document.getElementById('displayContact').innerText = donorData.contact;
        document.getElementById('displayAddress').innerText = donorData.address;
        document.getElementById('displayDistrict').innerText = donorData.district;

        document.getElementById('editName').value = donorData.name;
        document.getElementById('editDob').value = donorData.dob;
        document.getElementById('editWeight').value = donorData.weight;
        document.getElementById('editBloodType').value = donorData.bloodType;
        document.getElementById('editContact').value = donorData.contact;
        document.getElementById('editAddress').value = donorData.address;
        document.getElementById('editDistrict').value = donorData.district;

        document.getElementById('editDonorForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                name: document.getElementById('editName').value,
                dob: document.getElementById('editDob').value,
                weight: document.getElementById('editWeight').value,
                bloodType: document.getElementById('editBloodType').value,
                contact: document.getElementById('editContact').value,
                address: document.getElementById('editAddress').value,
                district: document.getElementById('editDistrict').value,
                latitude: lat || donorData.latitude || null,
                longitude: lng || donorData.longitude || null
            };
            await updateDonorDetails(donorId, updatedData);
        });
    }
}

async function updateDonorDetails(donorId, updatedData) {
    try {
        await database.ref('donors/' + donorId).update(updatedData);
        alert('Donor info updated.');
        navigateToeditdonor();
    } catch (error) {
        console.error('Error updating donor:', error);
        alert('Failed to update donor.');
    }
}

function getCoords() {
    if (!navigator.geolocation) {
        alert('Geolocation not supported by your browser.');
        return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        document.getElementById('output').innerText = `Lat: ${lat}, Lng: ${lng}`;
    }, () => {
        alert('Unable to retrieve your location.');
    });
}

function goBack() {
    window.location.reload();
}

function getAndPushIP() {
    // Optional function to get IP address
}
