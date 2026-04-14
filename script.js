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

// 3. Submit Grievance Logic
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
        // Clear fields
        document.getElementById('patientName').value = "";
        document.getElementById('uhid').value = "";
        document.getElementById('description').value = "";
        document.getElementById('rating').value = "5"; 
    })
    .catch((error) => {
        console.error("Submission Error:", error);
        alert("Error submitting. Please check your internet or Firebase Rules.");
    });
}

// 4. Check Status (The Best Index-Free Fix)
function checkStatus() {
    const searchUHID = document.getElementById('checkUHID').value;
    const resultDisplay = document.getElementById('statusResult');

    if (!searchUHID) {
        alert("Please enter a UHID to search.");
        return;
    }

    resultDisplay.innerText = "Connecting to secure server...";

    db.collection("grievances")
      .where("uhid", "==", searchUHID)
      .get()
      .then((querySnapshot) => {
          if (!querySnapshot.empty) {
              let docs = [];
              querySnapshot.forEach(doc => docs.push(doc.data()));
              
              // Local sort to avoid Firebase Index Requirement
              docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
              let latestDoc = docs[0];

              let statusColor = "#e67e22"; 
              if(latestDoc.status === "Resolved") statusColor = "#27ae60";
              if(latestDoc.status === "Under Review") statusColor = "#2980b9";

              resultDisplay.innerHTML = `
                <div style="margin-top:15px; background: white; padding: 15px; border-radius: 10px; border-left: 6px solid ${statusColor}; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <strong style="display:block; font-size: 16px; color:#333;">Current Status: <span style="color:${statusColor};">${latestDoc.status}</span></strong>
                    <small style="color:#666;">Dept: ${latestDoc.department}</small><br>
                    <small style="color:#888;">Updated: ${latestDoc.timestamp ? latestDoc.timestamp.toDate().toLocaleDateString() : 'Just now'}</small>
                </div>`;
          } else {
              resultDisplay.innerHTML = "<div style='color:#e74c3c; margin-top:15px; font-weight:bold;'>No record found for this UHID.</div>";
          }
      })
      .catch((error) => {
          console.error("Error:", error);
          resultDisplay.innerText = "Connection error. Please check Brave Shields or AdBlock.";
      });
}

// 5. Chatbot Logic
function toggleChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const content = document.getElementById('chat-content');
    if(!input.value) return;

    content.innerHTML += `<p><strong>You:</strong> ${input.value}</p>`;
    
    let response = "I'm still learning! For urgent help, please visit the Front Desk.";
    const val = input.value.toLowerCase();
    
    if(val.includes("timing") || val.includes("opd")) response = "OPD timings: 9:00 AM to 5:00 PM (Mon-Sat).";
    if(val.includes("billing")) response = "The Billing desk is on the Ground Floor near the exit.";
    if(val.includes("status") || val.includes("check")) response = "Use the UHID status box above to track your grievance!";
    if(val.includes("hi") || val.includes("hello")) response = "Hello! I am the Velmed Assistant. How can I help you?";

    setTimeout(() => {
        content.innerHTML += `<p style="color:#00668c; background:#eef; padding:8px; border-radius:8px;"><strong>AI:</strong> ${response}</p>`;
        content.scrollTop = content.scrollHeight;
    }, 500);

    input.value = "";
}
