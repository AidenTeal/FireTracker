import { updateDoc, collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../config/firebase.js";

export const useUpdateDoc =() => {
    const fireNotiCollectionRef = collection(db, "userTrackers")

    const updateFireDocument = async ({ phoneNumber, range }) => {
        const queryTracker = query(fireNotiCollectionRef, where("phoneNumber", "==", phoneNumber));
        const querySnapshot = await getDocs(queryTracker);
        
        querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, { range: range });
        });
    };

    return {updateFireDocument};
}