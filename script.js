// Global variables to hold Google Sheets API and OAuth client information
let gapiLoaded = false;
let SHEET_ID = '17xxan9QpTSfKP7B8MmfsVSnsI9r5tg6BAU3F7KVaZdg'; // Replace with your actual Google Sheets ID
let API_KEY = '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'; // Replace with your Google Sheets API key
let CLIENT_ID = '704525461093-8itmgn4dqt90kaec6eau2quvfatilnj8.apps.googleusercontent.com'; // Replace with your OAuth client ID

// Function to handle form submission
function handleFormSubmit() {
  // Get the form input values
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Prepare the data to be sent to the Google Sheet
  const values = [[name, email, message]];

  const requestBody = {
    values: values,
  };

  // Make a call to the Google Sheets API
  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'A1:C1', // Adjust the range as needed
    valueInputOption: 'RAW',
    resource: requestBody,
  })
    .then((response) => {
      console.log('Data successfully added to the Google Sheet!');
      alert('Data successfully added to the Google Sheet!');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error adding data to the Google Sheet.');
    });
}

// Function to load Google API and setup the sheets service
function initClient() {
  gapi.client.setApiKey(API_KEY);
  return gapi.client
    .load('https://sheets.googleapis.com/$discovery/rest?version=v4')
    .then(() => {
      console.log('GAPI client loaded for Google Sheets API');
      gapiLoaded = true;
    })
    .catch((error) => {
      console.error('Error loading GAPI client for Google Sheets API:', error);
    });
}

// Wait for the Google API to be ready, and then set up the button click event
function onApiLoad() {
  gapi.load('client', initClient);
}

// Add event listener to the submit button
document.getElementById('submit').addEventListener('click', () => {
  if (!gapiLoaded) {
    alert('Google Sheets API is not loaded yet. Please wait.');
    return;
  }
  handleFormSubmit();
});

onApiLoad();

