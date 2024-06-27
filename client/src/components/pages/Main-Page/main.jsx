import { useEffect } from "react";
import { useState } from "react";
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import Papa from 'papaparse'
import { FireMarkers } from "../../MapMarkers/FireMarkers";
import { UserMarker } from "../../MapMarkers/UserMarker";
import { supportedCountries } from "../../supportedCountries";
import { openWeatherAPI, nasaAPI, gAPI } from "../../../config/apiKeys";
import { calculateDistance } from "../../../distanceHandler/calculateDistance";
import './main.css';
import FireTrackerGood from '../../../Icons/FireTrackerGood.png';
import SearchIcon from '../../../Icons/SearchIcon.png';
import FireGif from '../../../Icons/FireGif.gif';
import { SMS } from '../SMS/sms';

export const Main = () => {
    const [location, setLocation] = useState("");
    const [range, setRange] = useState(0);
    const [country, setCountry] = useState("");
    const [fireList, setFireList] = useState([]);
    const [currentDay, setCurrentDay] = useState("");
    const [fireLocation, setFireLocation] = useState([]);
    const [userCoordinates, setUserCoordinates] = useState(null);

    useEffect(() => {
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
        setCurrentDay(today)
    }, []);

    const getCountryCode = (country) => {
        const obj = supportedCountries.find(x => x.country === country || x.abbrev === country)
        if (obj !== undefined) {
            return obj.abbrev
        }
        // implement proper error handling here
        else {
            console.log(obj)
            return "CAN"
        }
    }

    const updateLocation = (e) => {
        setLocation(e.target.value)
    }

    const updateCountry = (e) => {
        setCountry(e.target.value)
        
        // implement error checking to ensure a valid country is typed, don't allow user to submit if country is invalid
        if (supportedCountries.find(x => x.country === e.target.value || x.abbrev === e.target.value) !== undefined) {
            console.log("Valid Country")
        } else {
            console.log("Invalid Country")
        }
    }

    const updateRange = (e) => {
        setRange(e.target.value)
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const countryCode = getCountryCode(country);

        const fetchFireData = async () => {
            try {
                const res = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/${nasaAPI}/VIIRS_SNPP_NRT/${countryCode}/1/${currentDay}`)
                const reader = res.body.getReader();
                const result = await reader.read();
                const decoder = new TextDecoder('utf-8');
                const csv = decoder.decode(result.value);
                const parsedData = Papa.parse(csv, { header: true });
                setFireList(parsedData.data);
                console.log(parsedData.data);
            } catch (err) {
                console.err(err)
            }
        }

        const fetchUserCoordinates = async () => {
            try {
                await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location},${countryCode}&limit=1&appid=${openWeatherAPI}`).then((res) => res.json())
                .then((data) => {
                    setUserCoordinates(data)
                    console.log("user coordinates:" + data)
                });
            } catch (err) {
                setUserCoordinates(null)
                console.log(err)
            }
        }

        await Promise.all([fetchFireData(), fetchUserCoordinates()]);
    }

    useEffect(() => {
        const locations = fireList.map((row) => ({
            countryCode: row.country_id,
            location: {
                lat: parseFloat(row.latitude),
                lng: parseFloat(row.longitude)
            }
        }));
        if (userCoordinates !== null && userCoordinates.length > 0) {
            const filteredLocations = locations.filter((row) => {
                return calculateDistance(row.location.lat, row.location.lng, userCoordinates[0].lat, userCoordinates[0].lon) <= range;
            })
            setFireLocation(filteredLocations);
            console.log("fire locations length: " + filteredLocations.length)
        }
    }, [fireList, range, userCoordinates]);

    return (
        <APIProvider apiKey={gAPI} onLoad={() => console.log('Maps API has loaded.')}>
            <div className="title">
                <img src={FireTrackerGood} alt="LogoIcon" className="fireTrackerLogo"/>
                <p className="fireGreeting">
                    Find fires in/around your area through a simple search!
                </p>
            </div>
            <div className="mapAndSearch">
                <form onSubmit={handleFormSubmit} className="searchBar">
                    <div className="inputCircle">
                        <input placeholder="Country" type="text" onChange={updateCountry} className="fireInput" style={{backgroundColor:'#7684ab'}}/>
                        <p> Country </p>
                    </div>
                    <div className="inputCircle">
                        <input placeholder="Location" type="text" onChange={updateLocation} className="fireInput" style={{backgroundColor:'#ffeba8'}}/>
                        <p> City/Town </p>
                    </div>
                    <div className="inputCircle">
                        <input placeholder="Range" type="number" onChange={updateRange} className="fireInput" style={{backgroundColor:'#de602a'}}/>
                        <p> Range (km) </p>
                    </div>
                    <div className="inputCircle">
                        <button className="searchButton"> 
                            <img src={SearchIcon} alt="search" className="searchIcon"/>    
                        </button>
                    </div>
                </form>
                
                    <div className="map">
                        {userCoordinates && fireLocation.length > 0 ?
                            <div style={{width: '100%', height: '100%'}} >
                                <>
                                    <Map
                                    style={{borderWidth: '5px', borderColor: '#de602a', borderStyle: 'solid'}}
                                    defaultZoom={13}
                                    defaultCenter={{ lat: parseFloat(userCoordinates[0].lat), lng: parseFloat(userCoordinates[0].lon) }}
                                    mapId='c2a824045eae4e95'
                                    onCameraChanged={(ev) =>
                                        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
                                    }
                                    >
                                        <FireMarkers pois={fireLocation} />
                                        <UserMarker pois={{location: {
                                            lat: parseFloat(userCoordinates[0].lat),
                                            lng: parseFloat(userCoordinates[0].lon)
                                        }}} />
                                    </Map>
                                </>  
                            </div>
                        :
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%', borderWidth: '5px', borderColor: '#de602a', borderStyle: 'solid' }}>
                                <>
                                    <img src={FireGif} alt='No Fires Found' className="fireGif"/>
                                    <p style={{fontSize: '18px'}}> No fires found! Check again later or update your search conditions. </p>
                                </>  
                            </div>           
                        }
                        <div className="fireCountBadge">
                            {fireLocation.length}
                            <p> Fires found! </p>
                        </div>
                    </div>
                    <SMS />
                
            </div>
            <p> Note: Ensure location name is followed by its province or state as seen here: "location, province" </p>
            <p> Note: Not all countries are supported </p>
        </APIProvider>
    )
}