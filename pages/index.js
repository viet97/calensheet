import HelloWorld from '../components/hello-world'
import gapi from "googleapis"
export default function Home() {
  const CLIENT_ID = "900185296667-ng4uaamvbe0p32891l8rrv7ne1lflheu.apps.googleusercontent.com"
  const API_KEY = "AIzaSyAF1uyOdZpqJNNYzqW0EUoPiro00PBbtC0"
  
  const signin = ()=>{
  }
  
  return (
    <div className="app">
      <div
      onClick={signin}>
        sign in google sheet
      </div>
    </div>
  )
}
