// 1. Firebase Configuration
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

// 2. Simple Submission Logic
function submitGrievance() {
    // Collect Data
    const name = document.getElementById('patientName').value;
    const uhid = document.getElementById('uhid').value;
    const dept = document.getElementById('department').value;
    const rate = document.getElementById('rating').value;
    const contact = document.getElementById('patientContact').value;
    const desc = document.getElementById('description').value;

    // Validate
    if (!name || !uhid || !desc || !contact) {
        alert("Please complete all fields so we can assist you better.");
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    // Send to Firebase
    db.collection("grievances").add({
        patientName: name,
        uhid: uhid,
        department: dept,
        rating: rate,
        patientContact: contact,
        description: desc,
        status: "Pending", // Default status for your Management Portal
        actionTaken: "",   // Empty for now, you will fill this in the Portal
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Smooth UI Transition
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("Submission failed. Please check your internet connection.");
        submitBtn.innerText = "Submit Grievance";
        submitBtn.disabled = false;
    });
}
