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
          1. fetch() // Fetch the IP address from ipinfo.io
          2. .then() // Process the fetched IP address
          3. .catch() // Handle errors
          4. window.location.href // Redirect to index.html
          5. Array.isArray() // Check if the fetched data is an array(eg: Array.isArray(data)) data is in array format of json
          6. .json() // Parse the response as JSON

        
    */

    // Check if the user is authenticated
    async function fetchAllowedEmails() {
      try {
        const response = await fetch('allowed_users.json'); // Fetch the allowed users from allowed_users.json(i.e path of file)
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`); // Error handling
        }
        const data = await response.json(); // Parse the response as JSON
        if (!Array.isArray(data)) { // Check if the fetched data is an array
          throw new Error('Invalid data format: expected an array');
        }
        return data; // Return the fetched data (eg : return array of allowed users)
      } catch (error) {
        console.error('Error fetching allowed users:', error);
        alert(`Error fetching allowed users: ${error.message}`);
        throw error;
      }
    }
    

    //>>>>>>>>
    /*
        M in js :
          1. window.onload // Check if the user is authenticated
          2. .then() // Process the fetched IP address
          3. .catch() // Handle errors
          4. window.location.href // Redirect to index.html
          5. .json() // Parse the response as JSON
          6. .includes() // Check if the user's email is in the allowed users list
        M in firebase :
          1. onAuthStateChanged() // Check if the user is authenticated
        
    */
    // Check if the user is authenticated
    window.onload = function() {
      auth.onAuthStateChanged(async (user) => { // Check if the user is authenticated in firebase
        if (user) { // User is authenticated
          try {
            const allowedEmails = await fetchAllowedEmails(); // fetch the allowed users from allowed_users.json function call
            if (!allowedEmails.includes(user.email)) { // Check if the user's email is in the allowed users list
              window.location.href = 'user.html'; // Redirect to user.html if the user's email is not in the allowed users list
            } else {
              fetchDonors(); // Fetch the donors from firebase if the user's email is in the allowed users list
            }
          } catch (error) {
            alert('Error fetching allowed users. Please try again later.');
          }
        } else {
          window.location.href = 'index.html'; // Redirect to index.html if the user is not authenticated
        }
      });
    };
    //>>>>>>>>

    /*
      organisation of the code for distance fetching the list.html:
      -> fetchDistances() // Fetch the distances between the donors and the recipient -> getCoordinates() // Get the coordinates of the place 
                                                                                      -> calculateDistance() // Calculate the distance between two places 
                                                                                      -> displayDonors() // Display the donors in the donors list
    //>>>>>>>>
    /*
        M in js :
          1. fetch() // Fetch the IP address from ipinfo.io
          2. .then() // Process the fetched IP address
          3. .catch() // Handle errors
          4. console.log() // Log the fetched IP
          5. .ref
        
      // finding the coordinates of the place
      by using the openrouteservice API
            // finding the coordinates of the place
             eg : https://api.openrouteservice.org/geocode/search?api_key={api_key}&text={place}  // encodeURIcomponent is used to encode the place name for example if the place name is "New York" then it will be encoded as "New%20York"

    */
    const apiKey = '5b3ce3597851110001cf6248707eb42f8c9c4160961e9baecd37b843';

    async function getCoordinates(place) {
      const geocodeUrl = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(place)}`;
      const response = await fetch(geocodeUrl); // Fetch the coordinates of the place return the coordinates in json format
      if (!response.ok) throw new Error('Failed to fetch coordinates'); // Error handling
      const data = await response.json(); // Parse the response as JSON
      if (data.features && data.features.length > 0) { // Check if the data has features and the length of features is greater than 0
        const [lon, lat] = data.features[0].geometry.coordinates;
        console.log(`Coordinates for ${place}: ${lat}, ${lon}`); // Log the coordinates of the place
        return { lat, lon }; // Return the coordinates of the place
      } else {
        throw new Error(`Unable to find coordinates for ${place}`); // Error handling
      }
    }
    //>>>>>>>>

    //>>>>>>>>
    /*
      M in maps api:
        1. .toFixed() // Round the distance to 2 decimal places
        2. .features // Check if the data has features and the length of features is greater than 0
        3. .properties.segments[0].distance // Calculate the distance between two places
        4. .toFixed() // Round the distance to 2 decimal places
        
      M  in js :
        1. fetch() // Fetch the directions from the openrouteservice API
        2. .then() // Process the fetched directions
        3. .catch() // Handle errors
        4. .toFixed() // Round the distance to 2 decimal places
        5. console.log() // Log the distance
        6. return // Return the distance
      // Calculate the distance between two places
      by using the openrouteservice API
          // Calculate the distance between two places like start and end using car driving mode
          eg : https://api.openrouteservice.org/v2/directions/driving-car?api_key={api_key}&start={start}&end={end}  // start and end are the coordinates of the places
    */
    async function calculateDistance(startCoords, endCoords) {
      const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords.lon},${startCoords.lat}&end=${endCoords.lon},${endCoords.lat}`; 
      const response = await fetch(directionsUrl); // Fetch the directions from the openrouteservice API
      if (!response.ok) throw new Error('Failed to calculate distance');
      const data = await response.json(); // Parse the response as JSON
      if (data.features && data.features[0]) { // Check if the data has features and the length of features is greater than 0
        const distance = data.features[0].properties.segments[0].distance / 1000; // Calculate the distance between two places
        console.log(`Distance from ${startCoords.lat},${startCoords.lon} to ${endCoords.lat},${endCoords.lon}: ${distance.toFixed(2)} km`);
        return distance.toFixed(2); // Return the distance eg : 2 decimal places
      } else {
        throw new Error('Unable to calculate distance');
      }
    }
    //>>>>>>>>


    //>>>>>>>>
    /*

    */
    async function fetchDistances() {
      const recipientAddress = document.getElementById('recipientAddress').value; // Get the recipient's address
      let sendAlertButton = document.getElementById("sendAlertButton");
      sendAlertButton.disabled = true;
      if (!recipientAddress) {
        alert('Please enter the recipient\'s address.');
        return;
      }

      try {
        document.getElementById('distancesLoading').style.display = 'block'; // Display the loading spinner
        const recipientCoords = await getCoordinates(recipientAddress); // Get the coordinates of the recipient's address
        const distancesList = document.getElementById('distancesList'); // Get the distances list
        distancesList.innerHTML = '';

        const distances = [];

        for (const id in donors) { // Loop through the donors address to calculate the distance
          const donor = donors[id]; // Get the donor's address
          const donorCoords = await getCoordinates(donor.district); // Get the coordinates of the donor's address for each donor store in donorCoords
          const distance = await calculateDistance(donorCoords, recipientCoords); // Calculate the distance between the donor's address and the recipient's address store in distance
          distances.push({ donor, distance }); // Push the donor and distance to the distances list (i.e append the donor and distance to the list)
        }
        distances.sort((a, b) => Math.abs(a.distance - b.distance)); // sort the distances list based on the distance

        if (distances.length === 0) { // Check if the length of distances is 0
          document.getElementById('distanceError').style.display = 'block';
        } 
        else { // Display the donor's name, blood type, contact, address and distance
          document.getElementById('distanceError').style.display = 'none';
          distances.forEach(item => { // Loop through the distances list
            const listItem = document.createElement('li'); // Create a list item
            listItem.classList.add('donor-item'); 
            listItem.innerHTML = `<span class="donor-name">${item.donor.name}</span> - ${item.donor.bloodType} -  ${item.donor.contact} -  ${item.donor.district}  -  ${item.distance} km <div class="address">${item.donor.address}</div>`; // Display the donor's name, blood type, contact, address and distance for each donor according to the distance
            listItem.querySelector('.donor-name').addEventListener('click', () => { // Add an event listener to the donor's name to highlight the donor and distance and address
              listItem.classList.toggle('highlight'); // Toggle the highlight class
            });
            distancesList.appendChild(listItem); // Append the list item to the distancesList (i.e id of the list of innerHTML)
          });
        }
      } catch (error) {
        console.error('Error calculating distances:', error);
        document.getElementById('distanceError').style.display = 'block';
      } finally {
        document.getElementById('distancesLoading').style.display = 'none'; // Hide the loading spinner when the distances are calculated
        sendAlertButton.disabled = false;
         document.getElementById("sendAlertButton").style.backgroundColor = "red";
      }
    }
    //>>>>>>>>

    
    /*
      organisation of the code for display donors the list.html:
      -> fecthDonors() // Fetch the donors from Firebase -> displayDonors() // Display the donors in the donors list  
     
    */
    let donors = []; // Initialize the donors array
    let currentPage = 1; // Initialize the currentPage to 1
    const pageSize = 10;  // Initialize the pageSize to 10
    /*
      M in js:

        1. async // Fetch the donors from Firebase (i.e database.ref('donors').once('value'))
    */
    async function fetchDonors() {
      try {
        document.getElementById('donorsLoading').style.display = 'block';
        const snapshot = await database.ref('donors').once('value'); // Fetch the donors from Firebase
        donors = snapshot.val() || {}; // Store the donors in the donors array
        displayDonors(); // Display the donors in the donors list innerHTML function call
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        document.getElementById('donorsLoading').style.display = 'none';
      }
    }
    //>>>>>>>>


    //>>>>>>>>
    /*
      M in js:
        1. .innerHTML // Display the donors in the donors list
        2. .slice() // Slice the donors array based on the start and end
        3. .forEach() // Loop through the donors array
        4. .createElement() // Create a list item
        5. .classList.add() // Add the donor-item class to the list item

      M in firebase:
        1. .name // Display the donor's name
        2. .bloodType // Display the donor's blood type
        3. .contact // Display the donor's contact
        4. .address // Display the donor's address

        

    */
    function displayDonors() {
      const donorsList = document.getElementById('donorsList');
      donorsList.innerHTML = '';

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;

      const currentDonors = Object.values(donors).slice(start, end); // Slice the donors array based on the start and end

      currentDonors.forEach(donor => { // Loop through the donors array display the donor's name, blood type, contact and address
        const listItem = document.createElement('li'); // Create a list item
        listItem.classList.add('donor-item'); // Add the donor-item class to the list
        listItem.innerHTML = `<span class="donor-name">${donor.name}</span> - ${donor.bloodType} - ${donor.contact} <div class="address">${donor.address}</div>`; // Display the donor's name, blood type, contact and address
        //>
        listItem.querySelector('.donor-name').addEventListener('click', () => { // Add an event listener to the donor's name to highlight the donor
          listItem.classList.toggle('highlight'); // Toggle the highlight class
        });
        //>

        donorsList.appendChild(listItem); // Append the list item to the donorsList (i.e id of the list of innerHTML)
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
    //>>>>>>>>

    // //>>>>>>>>
    // //HOld
    // let filter_phone=[]
    // function filterDonors() {
    //   const searchQuery = document.getElementById('search').value.toLowerCase();
    //   const donorsList = document.getElementById('donorsList');
    //   donorsList.innerHTML = '';
    //   filter_phone=[]
    //   const filteredDonors = Object.values(donors).filter(donor =>
    //     donor.name.toLowerCase().includes(searchQuery) ||
    //     donor.bloodType.toLowerCase().includes(searchQuery)
    //   );

    //   filteredDonors.forEach(donor => {
    //     const listItem = document.createElement('li');
    //     listItem.classList.add('donor-item');
    //     listItem.innerHTML = `<span class="donor-name">${donor.name}</span> - ${donor.bloodType} - ${donor.contact} <div class="address">${donor.address}</div>`;
    //     filter_phone.push('${donor.contact}')
    //     listItem.querySelector('.donor-name').addEventListener('click', () => {
    //       listItem.classList.toggle('highlight');
    //     });
    //     donorsList.appendChild(listItem);
    //   });
    // }

        
  // email
  document.getElementById('sendAlertButton').addEventListener('click', async function() {
          alert('Sending Email...'); // Notify the user before sending
      
          try {
              const response = await fetch('https://ptest.up.railway.app/alert', { 
                  method: 'POST'
              });
      
              const result = await response.json();
              if (response.ok) {
                  alert('Email Sent Successfully!');
              } else {
                  alert('Failed to send email: ' + result.error);
              }
          } catch (error) {
              alert('Error sending request: ' + error.message);
          }
      });
      

  //   //twilio
  
   
  //  async function sendsms() {
  //   // const accountSid = 'ACd0820c8fb546c38be1760536009548cc'; // Your Account SID from www.twilio.com/console
  //     const authToken = 'a07946d79b75d7a24937ba7ffcf5f083';  // Your Auth Token from www.twilio.com/console
  //     const twilio_number='+15856693126' ;
  //   const filter_phone = ['8247341184']; // Example phone numbers array

  //   for (let i = 0; i < filter_phone.length; i++) {
  //     let num = filter_phone[i];
  //     if (num === '8247341184') {
  //       num = '+91' + num;
  //       const from = twilio_number;
  //       const to = num;
  //       const body = 'Hello from Twilio!';

  //       try {
  //         const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
  //           method: 'POST',
  //           headers: {
  //             'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
  //             'Content-Type': 'application/x-www-form-urlencoded'
  //           },
  //           body: new URLSearchParams({
  //             Body: body,
  //             From: from,
  //             To: to
  //           })
  //         });
  //         const data = await response.json();
  //         console.log(data.sid);
  //       } catch (err) {
  //         console.error(err);
  //       }
  //     } else {
  //       console.log('Message not sent');
  //     }
  //   }
  // }

  // document.getElementById('sendAlertButton').addEventListener('click', function() {
  //   sendsms();
  //   alert('SMS has been sent!');
  // });
