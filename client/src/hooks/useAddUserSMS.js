import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase.js";


export const useAddUserSMS = () => {
    const fireNotiCollectionRef = collection(db, "userTrackers")

    const addTransaction = async ({phoneNumber, country, location, range}) => {
        await addDoc(fireNotiCollectionRef, {
            phoneNumber,
            country,
            location,
            range
        })
    };

    
    return {addTransaction};
}