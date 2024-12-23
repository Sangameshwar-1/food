from flask import Flask, jsonify, request
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

app = Flask(__name__)

# Your credentials as a dictionary (replace with your actual credentials)
google_creds = {
    "type": "service_account",
    "project_id": "hub-data-445305",
    "private_key_id": "ce2f216a9e65dc80e4aa0a9974541bbfcfdef2a3",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDkvj36exYcRBUE\n/D665xqf3KcpNgCwy4Hd1wAOa/hjGmrAkh+EgZvzdNeXn9ZEsKCthkdBsDtiyB7c\nvGR9NYYGftUE9IgVbZyUy3ZYvVytBz6Myo7ma4xj0iaHeb3zd+kA4Ec7HaAjaHmA\nS8ACCXvZWZQWiL8A0IMUyBa+nf+IKXie6bdmL9wGwcihPY4V1Djd54ofSlkLGWHU\nyfDZG2q6vgwwsNccf51rN2RyQe4+3tmm2g3AUGVeKfxC6m/mErVpsBOQQWNTNbRO\nBKswzwQhaqvAYfJ6bOg3oLVH/6ywmCzC7+FJ/wMm8UxXTM/Nmqo4h9ugk0/02Hoo\nJqhejnDvAgMBAAECggEABZaEKxdQrfYX0VxcJ/K3WspoJwCTub3u+T1kWfXXRoyB\nqRyounL0HVlwXtrfwCPUeQi7uuYUPVCIOHo9tjVVhdkZWRqkLGnWFmh2BqrxlaSE\nqanVHdnovxOGL28Q7d6zCXtxIgeSPusxdKnlEeerZ97hWD+U8u8lFJ/itltjv66/\n2PZkkQJUZa9w9YP/G2NhZ/61jDJCYJRL2cHcJLOe2rhX+S4UFIL7UqMbd14ufcnT\neX9wP5MYZC6O94DS2qTXMs+h9mxdd8iKz3apCL8xiYL/5XF5Hy2zGqS0K5enKOyc\nqEh+PvjluTgG8es/CpPxFasFdd0crC8BatE5GoMbQQKBgQD388gAlPrdzfX0TSfu\nU7/W5h8zAU44LnShkIUgpqmJRnVk+2o0LeMha12iSoeMZGUJ2MdZCyIKF/fqpQjw\nFCbKyCjg/RdHTubu8gnchnrZCI3qv6SoOprkJnGmmiW3H1fpLx6J4uG0/p2OhZmJ\ngCb6gtk1vx3FZIWC8N4LXtWRYQKBgQDsKtp5WfAryn2x9PN3PeyZtoZf7T8I5xbZ\n15VCRqFINyuZsVmfetVvbaIYvrriavmHo2TGdF3aMMbpeNFK0X2cVewhdOQXMjKI\nmKqeJojj1C3q/Fzwmd9m/Yv9M+A8JqJZgCA/V+arCnc2jWRzQziTyiHqVhg72H2Q\nG9aeACsUTwKBgBAVTQTUpQ0cHfcRxiRMZGYxGRb637L/OGt+b1Q120tfOaAqOrJV\nw6TYTQOI6A/wNymTWSLqePPEqD0dJV5FQFro7tXhNNBYStx28LLQOkm3p1Txx2Fu\nI7vmznprB0VAkDg86TMyd0eBOIEVI2dq25xmPmahFfJG2e4rZ4u/RAUhAoGBAN+O\nDTM0HLIHQwayncjxWEeFTRv/A11VCv95IDQVkdQ/TUl2ZSUe7G1HNVsBKPztUHnC\nBMILI1BIPfKByHRva90SRKzC7qq6fLVq9o8wYQJxNmorK3sh3SSru9kaQxgNZj8c\nlun/Nj4QcRq1qzGknyje/U3K47O60dkZUQZNmHnnAoGBAMlzaYq6xDvKoCQwITxF\ncXsc5ebfjDsxoYTrenm58kyLu0cmsOJKVN1Dd3ZTeXdoW+eYzxs5GcVxes5YtLrU\nbYZpPLdsiaUKUXinTrdnIqGfeWTfJHTcQ3gfmD4Uytgg64A7HYRHN7lnZCJlr494\nOC2+I4YCb0hmYs3naR7vkHC+\n-----END PRIVATE KEY-----\n",
    "client_email": "hub-data@hub-data-445305.iam.gserviceaccount.com",
    "client_id": "117226083300285046688",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/hub-data%40hub-data-445305.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

# Function to authenticate with Google Sheets using the embedded credentials
def authenticate_google_sheets():
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(google_creds, scope)
    client = gspread.authorize(credentials)
    return client

@app.route('/send_data', methods=['POST'])
def send_data():
    data = request.json
    if not data or 'rows' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Authenticate with Google Sheets
    client = authenticate_google_sheets()

    # Open the spreadsheet (replace 'Your Spreadsheet Name' with your sheet name)
    sheet = client.open('blood').sheet1

    # Append rows to the sheet
    for row in data['rows']:
        sheet.append_row(row)

    return jsonify({'message': 'Data sent successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))

