const firebaseConfig = {
  apiKey: "AIzaSyDikrV0xVMX6ZGA4_qZWlN_Dr_nR_PnWWk",
  authDomain: "velmed-hospital-feedback.firebaseapp.com",
  projectId: "velmed-hospital-feedback",
  storageBucket: "velmed-hospital-feedback.firebasestorage.app",
  messagingSenderId: "271213008018",
  appId: "1:271213008018:web:f3e5136d18b8a64a02c24b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function submitGrievance() {
    const name = document.getElementById('patientName').value;
    const uhid = document.getElementById('uhid').value;
    const dept = document.getElementById('department').value;
    const cat = document.getElementById('category').value;
    const rating = document.getElementById('rating').value; // New Rating
    const desc = document.getElementById('description').value;

    if (!name || !desc) {
        alert("Please fill in the Patient Name and Description.");
        return;
    }

    db.collection("grievances").add({
        patientName: name,
        uhid: uhid,
        department: dept,
        category: cat,
        rating: rating, // Saved to Firebase
        description: desc,
        status: "Pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Grievance submitted successfully to Management.");
        // Clear all fields
        document.getElementById('patientName').value = "";
        document.getElementById('uhid').value = "";
        document.getElementById('description').value = "";
        document.getElementById('rating').value = "5"; 
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        alert("Error submitting. Please check your internet connection.");
    });
}
