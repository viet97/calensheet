// import gapi from "googleapis"
import Script from 'next/script';
import { useState } from 'react';
import styles from "./index.module.scss";
import { Input } from "antd"
import DateTimePicker from 'react-datetime-picker';
import { WithContext as ReactTags } from 'react-tag-input';
import Autocomplete from "react-google-autocomplete";
import { map, trim } from 'lodash';
import moment from "moment"
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
  const [sheetId, setSheetId] = useState("")
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [tags, setTags] = useState([]);
  const [count, setCount] = useState(0)
  const [storeName, setStoreName] = useState("")

  const GG_MAP_API_KEY = "AIzaSyAF1uyOdZpqJNNYzqW0EUoPiro00PBbtC0"
  const CLIENT_ID = "900185296667-dg1gdnl5rgtgch5hdtf5ns8aqhttvchu.apps.googleusercontent.com"
  const API_KEY = "AIzaSyAF1uyOdZpqJNNYzqW0EUoPiro00PBbtC0"
  const DISCOVERY_DOC = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    'https://sheets.googleapis.com/$discovery/rest?version=v4'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets';
  // const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly'
  function gisLoaded() {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    setTokenClient(tokenClient)
    setgisInited(true)
  }

  function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
  }

  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
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
    console.log("tag", tag)
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
      'summary': trim(title),
      'location': trim(location),
      'description': trim(description),
      'start': {
        'dateTime': '2023-05-11T09:00:00',
        'timeZone': 'Asia/Ho_Chi_Minh'
      },
      'end': {
        'dateTime': '2023-05-11T17:00:00',
        'timeZone': 'Asia/Ho_Chi_Minh'
      },
      // 'recurrence': [
      //   'RRULE:FREQ=DAILY;COUNT=2'
      // ],
      'attendees': map(tags, tag => ({
        'email': tag?.text
      })),
      'reminders': {
        'useDefault': false,
        'overrides': [
          // { 'method': 'email', 'minutes': 24 * 60 },
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

    //gg sheet api
    let values = [
      [
        trim(storeName), trim(title), trim(count), new Date(), new Date(), "", trim(description)
      ],
    ];
    const body = {
      values: values,
    };
    try {
      gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Trang tính1',
        valueInputOption: "USER_ENTERED",
        resource: body,
      }).then((response) => {
        const result = response.result;
        console.log(`result`, result);
      });
    } catch (reason) {
      console.error("create Sheet Error", reason?.message)
    }

  }

  const onChangeEndTime = (date) => {
    const date1 = new Date()
    date1.toLocaleString
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
          Sheet Id:  <Input
            className={styles.input}
            placeholder="Enter id"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
        </div>

        <div
          className={styles.title}>
          Chương trình :  <Input
            className={styles.input}
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div
          className={styles.title}>
          Địa điểm :  <Autocomplete
            language="vi"
            apiKey={GG_MAP_API_KEY}
            onPlaceSelected={(place) => {
              setLocation(place?.formatted_address || "")
            }}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div
          className={styles.title}>
          Nội dung :  <Input
            className={styles.input}
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div
          className={styles.title}>
          Bắt đầu :   <DateTimePicker onChange={onChangeStartTime} value={startTime} locale="" />
        </div>
        <div
          className={styles.title}>
          Kết thúc : <DateTimePicker onChange={onChangeEndTime} value={endTime} />
        </div>
        <div
          className={styles.title}>
          Người tham dự (Enter, space hoặc dấu phẩy để thêm email mới) :  <ReactTags
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

        <div
          className={styles.title}>
          Số lượng cơ sở :  <Input
            className={styles.input}
            placeholder="Enter number"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        <div
          className={styles.title}>
          Chuỗi :  <Input
            className={styles.input}
            placeholder="Enter StoreName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>


        <div
          onClick={createEvent}
          className={styles.createEvent}>
          Create Event
        </div>
      </div>
    </div>
    <Script async defer src="https://apis.google.com/js/api.js" onLoad={gapiLoaded} onError={e => console.log(e)} ></Script>
    <Script async defer src="https://accounts.google.com/gsi/client" onLoad={gisLoaded} onError={e => console.log(e)} ></Script>
  </>)
}
