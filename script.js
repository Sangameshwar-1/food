// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit');
    
    // Add an event listener to the submit button after DOM is loaded
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Simple validation before submitting
            if (!name || !email || !message) {
                alert("Please fill all fields.");
                return;
            }

            // Call the function to submit the form to Google Sheets
            submitToGoogleSheets(name, email, message);
        });
    } else {
        console.log("Submit button not found");
    }
});

// Function to submit data to Google Sheets using Google API
function submitToGoogleSheets(name, email, message) {
    // Here you should replace with your own Google Sheets API logic
    console.log("Data to submit:", name, email, message);

    // Load the Google API client and authenticate
    gapi.load('client:auth2', function() {
        gapi.auth2.init({
            client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
        }).then(function() {
            gapi.client.load('sheets', 'v4', function() {
                // Replace with your Google Spreadsheet ID and desired range
                const params = {
                    spreadsheetId: 'Y17xxan9QpTSfKP7B8MmfsVSnsI9r5tg6BAU3F7KVaZdg', // Replace with your Google Spreadsheet ID
                    range: 'Sheet1!A1', // Update with your desired range
                    valueInputOption: 'RAW', // Define how values will be interpreted
                };

                // Data to submit to the spreadsheet
                const values = [
                    [name, email, message], // The data to be inserted in the sheet
                ];

                const body = {
                    values: values
                };

                // Make the API call to append data to the sheet
                const request = gapi.client.sheets.spreadsheets.values.append(params, body);
                request.then(function(response) {
                    console.log('Data submitted successfully:', response);
                    alert('Your data has been submitted successfully!');
                }, function(error) {
                    console.error('Error submitting data:', error);
                    alert('Error submitting your data.');
                });
            });
        });
    });
}

// Function to handle OAuth 2.0 client initialization
function initClient() {
    gapi.client.init({
        apiKey: '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', // Replace with your Google API Key
        clientId: '704525461093-8itmgn4dqt90kaec6eau2quvfatilnj8.apps.googleusercontent.com', // Replace with your Google Client ID
        scope: 'https://www.googleapis.com/auth/spreadsheets', // Scope to access Sheets
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(function () {
        console.log("Google API client initialized successfully.");
    }, function(error) {
        console.error("Error initializing Google API client:", error);
    });
}

// Load the Google API client library
function loadGoogleAPI() {
    gapi.load('client:auth2', initClient);
}

// Automatically load Google API on page load
window.onload = loadGoogleAPI;


