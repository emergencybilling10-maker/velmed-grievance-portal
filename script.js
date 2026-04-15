// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDikrV0xVMX6ZGA4_qZWlN_Dr_nR_PnWWk",
  authDomain: "velmed-hospital-feedback.firebaseapp.com",
  projectId: "velmed-hospital-feedback",
  storageBucket: "velmed-hospital-feedback.firebasestorage.app",
  messagingSenderId: "271213008018",
  appId: "1:271213008018:web:f3e5136d18b8a64a02c24b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function submitGrievance() {
    // Get Elements
    const name = document.getElementById('patientName').value;
    const uhid = document.getElementById('uhid').value;
    const dept = document.getElementById('department').value;
    const cat = document.getElementById('category').value;
    const rating = document.getElementById('rating').value; 
    const desc = document.getElementById('description').value;
    const contact = document.getElementById('contactInfo').value;

    // Basic Validation
    if (!name || !uhid || !desc || !contact) {
        alert("Please fill all the fields so we can assist you better.");
        return;
    }

    // Change button state
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Submitting...";
    btn.disabled = true;

    // Save to Firestore
    db.collection("grievances").add({
        patientName: name,
        uhid: uhid,
        department: dept,
        category: cat,
        rating: rating,
        description: desc,
        contactInfo: contact,
        status: "Pending", // For your internal portal
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Switch views: Hide form, Show success
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
    })
    .catch((error) => {
        console.error("Error:", error);
        alert("Submission failed. Please check your internet connection.");
        btn.innerText = "Submit Grievance";
        btn.disabled = false;
    });
}
