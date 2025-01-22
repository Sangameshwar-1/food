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

    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();

    async function fetchAllowedEmails() {
      try {
        const response = await fetch('allowed_users.json');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array');
        }
        return data;
      } catch (error) {
        console.error('Error fetching allowed users:', error);
        alert(`Error fetching allowed users: ${error.message}`);
        throw error;
      }
    }

    window.onload = function() {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const allowedEmails = await fetchAllowedEmails();
            if (!allowedEmails.includes(user.email)) {
              window.location.href = 'user.html';
            } else {
              fetchDonors();
            }
          } catch (error) {
            alert('Error fetching allowed users. Please try again later.');
          }
        } else {
          window.location.href = 'index.html';
        }
      });
    };

    const apiKey = '5b3ce3597851110001cf6248707eb42f8c9c4160961e9baecd37b843';

    async function getCoordinates(place) {
      const geocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(place)}`;
      const response = await fetch(geocodeUrl);
      if (!response.ok) throw new Error('Failed to fetch coordinates');
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        console.log(`Coordinates for ${place}: ${lat}, ${lon}`);
        return { lat, lon };
      } else {
        throw new Error(`Unable to find coordinates for ${place}`);
      }
    }

    async function calculateDistance(startCoords, endCoords) {
      const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords.lon},${startCoords.lat}&end=${endCoords.lon},${endCoords.lat}`;
      const response = await fetch(directionsUrl);
      if (!response.ok) throw new Error('Failed to calculate distance');
      const data = await response.json();
      if (data.features && data.features[0]) {
        const distance = data.features[0].properties.segments[0].distance / 1000;
        console.log(`Distance from ${startCoords.lat},${startCoords.lon} to ${endCoords.lat},${endCoords.lon}: ${distance.toFixed(2)} km`);
        return distance.toFixed(2);
      } else {
        throw new Error('Unable to calculate distance');
      }
    }

    async function fetchDistances() {
      const recipientAddress = document.getElementById('recipientAddress').value;
      if (!recipientAddress) {
        alert('Please enter the recipient\'s address.');
        return;
      }

      try {
        document.getElementById('distancesLoading').style.display = 'block';
        const recipientCoords = await getCoordinates(recipientAddress);
        const distancesList = document.getElementById('distancesList');
        distancesList.innerHTML = '';

        const distances = [];

        for (const id in donors) {
          const donor = donors[id];
          const donorCoords = await getCoordinates(donor.district);
          const distance = await calculateDistance(donorCoords, recipientCoords);
          distances.push({ donor, distance });
        }

        distances.sort((a, b) => a.distance - b.distance);

        if (distances.length === 0) {
          document.getElementById('distanceError').style.display = 'block';
        } else {
          document.getElementById('distanceError').style.display = 'none';
          distances.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('donor-item');
            listItem.innerHTML = `<span class="donor-name">${item.donor.name}</span> - ${item.donor.bloodType} - ${item.donor.contact} - ${item.distance} km <div class="address">${item.donor.address}</div>`;
            listItem.querySelector('.donor-name').addEventListener('click', () => {
              listItem.classList.toggle('highlight');
            });
            distancesList.appendChild(listItem);
          });
        }
      } catch (error) {
        console.error('Error calculating distances:', error);
        document.getElementById('distanceError').style.display = 'block';
      } finally {
        document.getElementById('distancesLoading').style.display = 'none';
      }
    }

    let donors = [];
    let currentPage = 1;
    const pageSize = 10;

    async function fetchDonors() {
      try {
        document.getElementById('donorsLoading').style.display = 'block';
        const snapshot = await database.ref('donors').once('value');
        donors = snapshot.val() || {};
        displayDonors();
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        document.getElementById('donorsLoading').style.display = 'none';
      }
    }

    function displayDonors() {
      const donorsList = document.getElementById('donorsList');
      donorsList.innerHTML = '';

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;

      const currentDonors = Object.values(donors).slice(start, end);

      currentDonors.forEach(donor => {
        const listItem = document.createElement('li');
        listItem.classList.add('donor-item');
        listItem.innerHTML = `<span class="donor-name">${donor.name}</span> - ${donor.bloodType} - ${donor.contact} <div class="address">${donor.address}</div>`;
        listItem.querySelector('.donor-name').addEventListener('click', () => {
          listItem.classList.toggle('highlight');
        });
        donorsList.appendChild(listItem);
      });

      document.getElementById('prevButton').disabled = currentPage === 1;
      document.getElementById('nextButton').disabled = end >= Object.values(donors).length;
    }

    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        displayDonors();
      }
    }

    function nextPage() {
      if ((currentPage * pageSize) < Object.values(donors).length) {
        currentPage++;
        displayDonors();
      }
    }
    let filter_phone=[]
    function filterDonors() {
      const searchQuery = document.getElementById('search').value.toLowerCase();
      const donorsList = document.getElementById('donorsList');
      donorsList.innerHTML = '';
      filter_phone=[]
      const filteredDonors = Object.values(donors).filter(donor =>
        donor.name.toLowerCase().includes(searchQuery) ||
        donor.bloodType.toLowerCase().includes(searchQuery)
      );

      filteredDonors.forEach(donor => {
        const listItem = document.createElement('li');
        listItem.classList.add('donor-item');
        listItem.innerHTML = `<span class="donor-name">${donor.name}</span> - ${donor.bloodType} - ${donor.contact} <div class="address">${donor.address}</div>`;
        filter_phone.push('${donor.contact}')
        listItem.querySelector('.donor-name').addEventListener('click', () => {
          listItem.classList.toggle('highlight');
        });
        donorsList.appendChild(listItem);
      });
    }

    //twilio
  
   
   async function sendsms() {
    // const accountSid = 'ACd0820c8fb546c38be1760536009548cc'; // Your Account SID from www.twilio.com/console
      const authToken = 'a07946d79b75d7a24937ba7ffcf5f083';  // Your Auth Token from www.twilio.com/console
      const twilio_number='+15856693126' ;
    const filter_phone = ['8247341184']; // Example phone numbers array

    for (let i = 0; i < filter_phone.length; i++) {
      let num = filter_phone[i];
      if (num === '8247341184') {
        num = '+91' + num;
        const from = twilio_number;
        const to = num;
        const body = 'Hello from Twilio!';

        try {
          const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              Body: body,
              From: from,
              To: to
            })
          });
          const data = await response.json();
          console.log(data.sid);
        } catch (err) {
          console.error(err);
        }
      } else {
        console.log('Message not sent');
      }
    }
  }

  document.getElementById('sendAlertButton').addEventListener('click', function() {
    sendsms();
    alert('SMS has been sent!');
  });
