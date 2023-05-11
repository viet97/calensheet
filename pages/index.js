// import gapi from "googleapis"
import Script from 'next/script';
import { useState } from 'react';
import styles from "./index.module.scss";
import { Input } from "antd"
import DateTimePicker from 'react-datetime-picker';
import { WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = {
  comma: 188,
  enter: 13,
  space: 32,
};
const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.space];

export default function Home() {
  const [gisInited, setgisInited] = useState(false)
  const [gapiInited, setgapiInited] = useState(false)
  const [tokenClient, setTokenClient] = useState()
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [tags, setTags] = useState([]);

  const CLIENT_ID = "900185296667-dg1gdnl5rgtgch5hdtf5ns8aqhttvchu.apps.googleusercontent.com"
  const API_KEY = "AIzaSyAF1uyOdZpqJNNYzqW0EUoPiro00PBbtC0"
  const DISCOVERY_DOC = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    'https://sheets.googleapis.com/$discovery/rest?version=v4'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets.readonly';
  // const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
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
      console.log("response", google.accounts)
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
      discoveryDocs: DISCOVERY_DOC,
    });
    setgapiInited(true)
  }

  const handleDelete = i => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = tag => {
    setTags([...tags, tag]);
  };

  const handleDrag = (tag, currPos, newPos) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };


  const createEvent = () => {
    const event = {
      'summary': 'Google I/O 2015',
      'location': '800 Howard St., San Francisco, CA 94103',
      'description': 'A chance to hear more about Google\'s developer products.',
      'start': {
        'dateTime': '2023-05-11T09:00:00',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': '2023-05-11T17:00:00',
        'timeZone': 'America/Los_Angeles'
      },
      // 'recurrence': [
      //   'RRULE:FREQ=DAILY;COUNT=2'
      // ],
      'attendees': [
        { 'email': 'lpage@example.com' },
        { 'email': 'sbrin@example.com' }
      ],
      'reminders': {
        'useDefault': false,
        'overrides': [
          { 'method': 'email', 'minutes': 24 * 60 },
          { 'method': 'popup', 'minutes': 10 }
        ]
      }
    };

    const request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });

    request.execute(function (event) {
    });
  }

  const onChangeEndTime = date => {
    setEndTime(date)
  }

  const onChangeStartTime = date => {
    setStartTime(date)
  }

  return (<>
    <div className={styles.wrapper}>
      <div
        className={styles.container}>
        {gisInited && gapiInited ? <div
          onClick={handleAuthClick}
          className={styles.loginGoogle}>
          Login
        </div> : null}
        <div
          className={styles.email}>
          User:
        </div>
        <div
          className={styles.title}>
          Event Title :  <Input
            className={styles.input}
            placeholder="Enter Title"
          // value={val}
          // onChange={(e) => handleChange(e)}
          />
        </div>
        <div
          className={styles.title}>
          Event Location :  <Input
            className={styles.input}
            placeholder="Enter Location"
          // value={val}
          // onChange={(e) => handleChange(e)}
          />
        </div>
        <div
          className={styles.title}>
          Event Description :  <Input
            className={styles.input}
            placeholder="Enter Description"
          // value={val}
          // onChange={(e) => handleChange(e)}
          />
        </div>
        <div
          className={styles.title}>
          Start Time :   <DateTimePicker onChange={onChangeStartTime} value={startTime} />
        </div>
        <div
          className={styles.title}>
          End Time : <DateTimePicker onChange={onChangeEndTime} value={endTime} />
        </div>
        <div
          className={styles.title}>
          Attendees :  <ReactTags
            tags={tags}
            suggestions={[]}
            delimiters={delimiters}
            handleDelete={handleDelete}
            handleAddition={handleAddition}
            handleDrag={handleDrag}
            inputFieldPosition="bottom"
            autocomplete
          />
        </div>

      </div>
    </div>
    <Script async defer src="https://apis.google.com/js/api.js" onLoad={gapiLoaded} onError={e => console.log(e)} ></Script>
    <Script async defer src="https://accounts.google.com/gsi/client" onLoad={gisLoaded} onError={e => console.log(e)} ></Script>
  </>)
}
