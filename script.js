// 1. Firebase Configuration (Your specific credentials)
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
        status: "Pending", // Default status
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Grievance submitted successfully to Management.");
        // Clear form fields
        document.getElementById('patientName').value = "";
        document.getElementById('uhid').value = "";
        document.getElementById('description').value = "";
        document.getElementById('rating').value = "5"; 
    })
    .catch((error) => {
        console.error("Submission Error:", error);
        alert("Error submitting. Please check your internet or disable AdBlockers.");
    });
}

// 4. Function to Check Status (The Index-Free Fix)
function checkStatus() {
    const searchUHID = document.getElementById('checkUHID').value;
    const resultDisplay = document.getElementById('statusResult');

    if (!searchUHID) {
        alert("Please enter a UHID to search.");
        return;
    }

    resultDisplay.innerText = "Connecting to secure server...";

    // We only query by UHID to avoid needing a Firebase Index
    db.collection("grievances")
      .where("uhid", "==", searchUHID)
      .get()
      .then((querySnapshot) => {
          if (!querySnapshot.empty) {
              let docs = [];
              querySnapshot.forEach(doc => docs.push(doc.data()));
              
              // Sort locally by time so the newest one shows first
              docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
              let latestDoc = docs[0];

              // Visual styling based on status
              let statusColor = "#e67e22"; // Orange for Pending
              if(latestDoc.status === "Resolved") statusColor = "#27ae60"; // Green
              if(latestDoc.status === "Under Review") statusColor = "#2980b9"; // Blue

              resultDisplay.innerHTML = `
                <div style="margin-top:15px; background: white; padding: 15px; border-radius: 10px; border-left: 6px solid ${statusColor}; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <strong style="display:block; font-size: 16px; color:#333;">Current Status: <span style="color:${statusColor};">${latestDoc.status}</span></strong>
                    <small style="color:#666;">Dept: ${latestDoc.department} | Cat: ${latestDoc.category}</small><br>
                    <small style="color:#888;">Updated: ${latestDoc.timestamp ? latestDoc.timestamp.toDate().toLocaleDateString() : 'Syncing...'}</small>
                </div>`;
          } else {
              resultDisplay.innerHTML = "<div style='color:#e74c3c; margin-top:15px; font-weight:bold;'>No record found for this UHID.</div>";
          }
      })
      .catch((error) => {
          console.error("Error:", error);
          resultDisplay.innerText = "Blocked by browser. Please turn off Shields/AdBlock.";
      });
}

// 5. Chatbot Interface Logic
function toggleChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const content = document.getElementById('chat-content');
    if(!input.value) return;

    // Show User Message
    content.innerHTML += `<p style="margin-bottom:10px;"><strong>You:</strong> ${input.value}</p>`;
    
    // AI Assistant Responses
    let response = "I'm still learning. For billing or clinical queries, please contact the front desk.";
    const val = input.value.toLowerCase();
    
    if(val.includes("timing") || val.includes("opd")) response = "Velmed OPD timings: 09:00 AM to 05:00 PM (Monday to Saturday).";
    if(val.includes("billing")) response = "The Billing Department is on the Ground Floor, next to the main Pharmacy.";
    if(val.includes("status") || val.includes("track")) response = "You can track your grievance by entering your UHID in the status box above.";
    if(val.includes("hello") || val.includes("hi")) response = "Hello! I am your Velmed Assistant. How can I help you today?";

    setTimeout(() => {
        content.innerHTML += `<p style="color:#00668c; background:#eef; padding:8px; border-radius:8px;"><strong>AI:</strong> ${response}</p>`;
        content.scrollTop = content.scrollHeight;
    }, 600);

    input.value = "";
}
