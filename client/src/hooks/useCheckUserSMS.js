import { query, collection, getDocs, where } from "firebase/firestore";
import { db } from "../config/firebase.js";

export const useCheckUserSMS = () => {
    const trackerCollectionRef = collection(db, "userTrackers");

    const getTransactions = async ({phoneNumber}) => {
        const queryTracker = query(trackerCollectionRef, where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(queryTracker);

        let docs = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            docs.push({ ...data });
        });


        return docs;
    };

    return { getTransactions };
};