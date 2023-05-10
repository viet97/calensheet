import HelloWorld from '../components/hello-world'
// import gapi from "googleapis"
import Script from 'next/script';
import { useState } from 'react';

export default function Home() {
  const [gisInited, setgisInited] = useState(false)
  const [gapiInited, setgapiInited] = useState(false)
  const [tokenClient, setTokenClient] = useState(false)
  const CLIENT_ID = "900185296667-dg1gdnl5rgtgch5hdtf5ns8aqhttvchu.apps.googleusercontent.com"
  const API_KEY = "AIzaSyAF1uyOdZpqJNNYzqW0EUoPiro00PBbtC0"
  const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

  function gisLoaded() {
    console.log("google.accounts.oauth2423")
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    setTokenClient(tokenClient)
    setgisInited(true)
  }

  function gapiLoaded() {
    console.log("google.accounts.oauth24")

    gapi.load('client', initializeGapiClient);
  }

  async function listMajors() {
    let response;
    try {
      // Fetch first 10 files
      console.log(" gapi.client.sheets.spreadsheets", gapi.client)
      response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '12cV3RgWhlI-VBRzGOvgzrXwpfcpV0_1jRhXeOlPGoNM',
        range: 'Tóm tắt',
      });
    } catch (err) {
      console.error("err", err)
    }
    const range = response?.result;
    if (!range || !range.values || range.values.length == 0) {
      console.log("noValueFound")
      return;
    }
    // Flatten to string to display
    const output = range.values.reduce(
      (str, row) => `${str}${row[0]} - ${row[1]} - ${row[2]}\n`,
      'Name, Major:\n');
    console.log("output", output)
  }

  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      await listMajors();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    setgapiInited(true)
  }

  return (
    <>
      <div className="app">
        <div
          onClick={handleAuthClick}>
          sign in google sheet
        </div>
      </div>
      <Script async defer src="https://apis.google.com/js/api.js" onLoad={gapiLoaded} onError={e => console.log(e)} ></Script>
      <Script async defer src="https://accounts.google.com/gsi/client" onLoad={gisLoaded} onError={e => console.log(e)} ></Script>
    </>
  )
}
