import NotificationIcon from "../../../Icons/notification.png";
import './sms.css';
import { useState } from "react";
import { useAddUserSMS } from "../../../hooks/useAddUserSMS.js";
import { useCheckUserSMS }  from "../../../hooks/useCheckUserSMS.js";
import { useUpdateDoc } from "../../../hooks/useUpdateDoc.js";
import axios from "axios";

export const SMS = () => {
    const [country, setCountry] = useState("");
    const [location, setLocation] = useState("");
    const [range, setRange] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const { getTransactions } = useCheckUserSMS()
    const { addTransaction } = useAddUserSMS();
    const { updateFireDocument } = useUpdateDoc();

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const docs = await getTransactions({phoneNumber});

        if (docs.length === 0 && country && location && phoneNumber) {
            addTransaction({ phoneNumber, country, location, range });
        } else {
            updateFireDocument({ phoneNumber, range });
        }
        e.target.reset()
    }   

    return (
        <div style={{borderWidth: "5px", borderColor: "#de602a", borderStyle: 'solid', margin: "20px", borderRadius: "20%", width: "20%", marginLeft: "10%"}}>
            <h2 style={{fontSize: "22px"}}> Want to receive SMS notifications for any fires near you? </h2>
            <form onSubmit={handleFormSubmit} style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                <input name="country" placeholder="Country" type="text" required onChange={(e) => setCountry(e.target.value)} style={{borderStyle: "solid", marginBottom: "10px", borderColor: "#de602a", height: "20px", width: "150px"}}/>
                <input name="location" placeholder="City/Town" type="text" required onChange={(e) => setLocation(e.target.value)} style={{borderStyle: "solid", marginBottom: "10px", borderColor: "#de602a", height: "20px", width: "150px"}}/>
                <input name="range" placeholder="Range" type="number" required onChange={(e) => setRange(e.target.value)} style={{borderStyle: "solid", marginBottom: "10px", borderColor: "#de602a", height: "20px", width: "150px"}}/>
                <input name="phoneNumber" placeholder="Phone: 'xxx-xxx-xxxx'" type="tel" required onChange={(e) => setPhoneNumber(e.target.value)} style={{borderStyle: "solid", marginBottom: "10px", borderColor: "#de602a", height: "20px", width: "150px"}}/>
                <button type="submit" style={{borderRadius: "20%", background: "none", borderStyle: "none", cursor: "pointer", marginBottom: "10px"}}>
                    <img src={NotificationIcon} alt="Submission Bell" style={{width: "40px", height: "40px"}} />
                </button>
            </form>
        </div>
    )
}
