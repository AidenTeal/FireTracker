import bodyParser from 'body-parser';
import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';
import cors from 'cors';  
import firebaseConfig from './config/firebase-config.js';  // Importing Firebase config
import { query, collection, getDocs } from 'firebase/firestore';
import serverApiKeys from "./config/serverApiKeys.js";
import supportedCountries from "./helperFunctions/supportedCountries.js";
import calcDistance from "./helperFunctions/calcDistance.js";
import Papa from 'papaparse'
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get('/api/send-sms', (req, res) => {
  res.send("From Server");
});

app.post('/api/send-sms', async (req, res) => {
  const { to, message } = req.body;
  try {
    const formattedTo = "+1".concat(to);
    const messageResponse = await client.messages.create({
      body: message,
      to: formattedTo,
      from: twilioPhoneNumber
    });
    res.status(200).json({ sid: messageResponse.sid });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ error: error.message });
  }
});






// Function to get transactions from Firestore

var locations = [];
var userCoordinates = null;

const getCountryCode = (country) => {
  const obj = supportedCountries.supportedCountries.find(x => x.country === country || x.abbrev === country)
  if (obj !== undefined) {
      return obj.abbrev
  }
}

const getCurrentDay = () => {
  // Get the current date
  var today = new Date();

  // Get the day of the month
  var dd = today.getDate();

  // Get the month (adding 1 because months are zero-based)
  var mm = today.getMonth() + 1;

  // Get the year
  var yyyy = today.getFullYear();

  // Add leading zero if the day is less than 10
  if (dd < 10) {
      dd = '0' + dd;
  } 

  // Add leading zero if the month is less than 10
  if (mm < 10) {
      mm = '0' + mm;
  } 

  // Format the date as mm-dd-yyyy and log it
  today = yyyy + '-' + mm + '-' + dd;

  return today;
}

const filterFireData = (range) => {
  if (userCoordinates !== null && userCoordinates.length > 0) {
    const filteredLocations = locations.filter((row) => {
        return calcDistance.calcDistance(row.location.lat, row.location.lng, userCoordinates[0].lat, userCoordinates[0].lon) <= range;
    })
    locations = filteredLocations;
  }
}

const sendTextToUser = async (phoneNumber, numOfFires, range) => {
  try {
    const response = await axios.post('http://localhost:5000/api/send-sms', {
        to: phoneNumber,
        message: "You have " + numOfFires + " fires within a " + range + " km range of you"
    });
  } catch (err) {
    console.error("Error from client:", err);
  }
}

const processUserNotis = async (location, country) => {
  const countryCode = getCountryCode(country);
  const currentDay = getCurrentDay();

  const fetchFireData = async () => {
    try {
      const res = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${serverApiKeys.nasaAPI}/VIIRS_SNPP_NRT/${countryCode}/1/${currentDay}`)
      const reader = res.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      const parsedData = Papa.parse(csv, { header: true });
      const fireData = parsedData.data;
      locations = fireData.map((row) => ({
        countryCode: row.country_id,
        location: {
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude)
        }
    }));
    } catch (err) {
      console.log(err)
    }
  }

  const fetchUserCoordinates = async () => {
    try {
      await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location},${countryCode}&limit=1&appid=${serverApiKeys.openWeatherAPI}`).then((res) => res.json())
      .then((data) => {
          userCoordinates = data;
      });
  } catch (err) {

      console.log(err)
  }
  }
  await Promise.all([fetchFireData(), fetchUserCoordinates()]);
}

const getTransactions = async () => {
  const trackerCollectionRef = collection(firebaseConfig.db, 'userTrackers');
  const queryTracker = query(trackerCollectionRef);
  const querySnapshot = await getDocs(queryTracker);

  let docs = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    docs.push({ ...data });
  });
  
  docs.map(async (data) => {
      await processUserNotis(data.location, data.country, data.range);
      filterFireData(data.range);
      if (locations.length > 0) {
        await sendTextToUser(data.phoneNumber, locations.length, data.range);
      }
    })
};

// Function to set up interval for running getTransactions
const smsText = () => {
  const thirtyMinutes = 30 * 60 * 1000;

  // Run the function immediately for the first time
  getTransactions();

  // Set up interval to run the function every 10 minutes
  setInterval(() => {
    getTransactions();
  }, thirtyMinutes);
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // Initialize the periodic task
  smsText();
});