// Your Google API Client ID
const CLIENT_ID = '704525461093-8itmgn4dqt90kaec6eau2quvfatilnj8.apps.googleusercontent.com';
const API_KEY = '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';
const SHEET_ID = '17xxan9QpTSfKP7B8MmfsVSnsI9r5tg6BAU3F7KVaZdg'; // Spreadsheet ID

// Authorize Google API Client
function authenticate() {
  return gapi.auth2.getAuthInstance().signIn();
}

// Load the Sheets API client
function loadClient() {
  gapi.client.setApiKey(API_KEY);
  return gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
}

// Append data to Google Sheets
function appendData() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const values = [
    [name, email, message]
  ];

  const body = {
    values: values
  };

  const request = gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:C', // Change sheet and range if needed
    valueInputOption: 'RAW',
    resource: body
  });

  request.then((response) => {
    alert('Data added to sheet');
  }, (error) => {
    alert('Error: ' + error.result.error.message);
  });
}

// Load and initialize Google API Client
function start() {
  gapi.load('client:auth2', () => {
    gapi.auth2.init({
      client_id: CLIENT_ID
    }).then(() => {
      document.getElementById('submit').addEventListener('click', () => {
        authenticate().then(loadClient).then(appendData);
      });
    });
  });
}

// Add event listener for the window load event
window.addEventListener('load', start);
