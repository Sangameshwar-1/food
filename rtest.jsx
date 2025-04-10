import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyAHt06CtReHyQRip-QqEGILFjOWH5cI98c',
  authDomain: 'blood-7b054.firebaseapp.com',
  databaseURL: 'https://blood-7b054-default-rtdb.firebaseio.com',
  projectId: 'blood-7b054',
  storageBucket: 'blood-7b054.firebasestorage.app',
  messagingSenderId: '926378767902',
  appId: '1:926378767902:web:21591c4e5d77c90c9ca00f',
  measurementId: 'G-HTGC1SJYH6',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        getAndPushIP();
      } else {
        window.location.href = 'index.html';
      }
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (date) => date.toLocaleString();

  const getAndPushIP = async () => {
    try {
      const response = await fetch('https://ipinfo.io/json');
      const data = await response.json();
      const userIP = data.ip;

      const ipRef = database.ref('viewerIPs');
      const snapshot = await ipRef.orderByChild('ip').equalTo(userIP).once('value');

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          ipRef.child(childSnapshot.key).update({ timestamp: formatDate(new Date()) });
        });
      } else {
        await ipRef.push({ ip: userIP, timestamp: formatDate(new Date()) });
      }
    } catch (error) {
      console.error('Error fetching or pushing IP:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const bloodType = e.target.bloodType.value;
    const contact = e.target.contact.value;
    const address = e.target.address.value;
    const district = e.target.district.value;

    try {
      await database.ref('donors').push({ name, bloodType, contact, address, district });
      alert('Donor added successfully!');
      uploadToSpreadsheet({ Name: name, 'Mobile No': contact, Address: address, Group: bloodType, District: district });
      e.target.reset();
    } catch (error) {
      console.error('Error adding donor:', error);
    }
  };

  const uploadToSpreadsheet = (data) => {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyQmqeF5tvpivhTT0YDKGFDdq3a7Vkyr1CslCg7wZHt23k4_kHQHRBY6xtg1cejYn1y/exec';
    fetch(scriptURL, {
      method: 'POST',
      body: new URLSearchParams(data),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then((res) => res.json())
      .then((response) => console.log('Success:', response))
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{user ? `Logged in as: ${user.email}` : 'Not logged in'}</h1>

      <form id="donorForm" onSubmit={handleSubmit} className="space-y-2">
        <input type="text" name="name" placeholder="Name" required className="border p-2" />
        <input type="text" name="bloodType" placeholder="Blood Type" required className="border p-2" />
        <input type="text" name="contact" placeholder="Contact" required className="border p-2" />
        <input type="text" name="address" placeholder="Address" required className="border p-2" />
        <input type="text" name="district" placeholder="District" required className="border p-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Donor</button>
      </form>

      <div className="flex gap-4">
        <button onClick={() => (window.location.href = 'list.html')} className="bg-green-500 text-white p-2 rounded">
          View Donors
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
          Logout
        </button>
      </div>
    </div>
  );
};

export default App;
