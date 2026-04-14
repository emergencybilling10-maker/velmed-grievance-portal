// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDikrV0xVMX6ZGA4_qZWlN_Dr_nR_PnWWk",
  authDomain: "velmed-hospital-feedback.firebaseapp.com",
  projectId: "velmed-hospital-feedback",
  storageBucket: "velmed-hospital-feedback.firebasestorage.app",
  messagingSenderId: "271213008018",
  appId: "1:271213008018:web:f3e5136d18b8a64a02c24b"
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. Function to Submit a New Grievance
function submitGrievance() {
    const name = document.getElementById('patientName').value;
    const uhid = document.getElementById('uhid').value;
    const dept = document.getElementById('department').value;
    const cat = document.getElementById('category').value;
    const rating = document.getElementById('rating').value; 
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
        rating: rating,
        description: desc,
        status: "Pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Grievance submitted successfully to Management.");
        // Reset form fields
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

// 4. Function to Check Grievance Status
function checkStatus() {
    const searchUHID = document.getElementById('checkUHID').value;
    const resultDisplay = document.getElementById('statusResult');

    if (!searchUHID) {
        alert("Please enter a UHID to search.");
        return;
    }

    resultDisplay.innerText = "Searching database...";

    db.collection("grievances")
      .where("uhid", "==", searchUHID)
      .orderBy("timestamp", "desc") // Added to ensure you get the most recent one first
      .limit(1)
      .get()
      .then((querySnapshot) => {
          if (!querySnapshot.empty) {
              let latestDoc = querySnapshot.docs[0].data();
              
              // Define Status UI Colors
              let statusColor = "#e67e22"; // Default: Orange (Pending)
              if(latestDoc.status === "Resolved") statusColor = "#27ae60"; // Green
              if(latestDoc.status === "Under Review") statusColor = "#2980b9"; // Blue

              resultDisplay.innerHTML = `
                <div style="margin-top:15px; background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 5px solid ${statusColor}; font-family: sans-serif;">
                    <strong style="display:block; margin-bottom:5px;">Current Status: <span style="color:${statusColor};">${latestDoc.status}</span></strong>
                    <small style="color: #666;">Department: ${latestDoc.department}</small><br>
                    <small style="color: #666;">Submitted on: ${latestDoc.timestamp ? latestDoc.timestamp.toDate().toLocaleDateString() : 'Just now'}</small>
                </div>`;
          } else {
              resultDisplay.innerHTML = "<div style='color:red; margin-top:15px;'>No record found for this UHID.</div>";
          }
      })
      .catch((error) => {
          console.error("Error fetching status:", error);
          // If sorting by timestamp fails, it's likely because an index is needed. 
          // Check your browser console for the link to create the required Firebase Index.
          resultDisplay.innerText = "Error retrieving data. Check console for index requirements.";
      });
}
