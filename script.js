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

// 3. Submit Grievance
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
        document.getElementById('patientName').value = "";
        document.getElementById('uhid').value = "";
        document.getElementById('description').value = "";
        document.getElementById('rating').value = "5"; 
    })
    .catch((error) => {
        alert("Submission Error. Check internet connection.");
    });
}

// 4. Check Status (The Index-Free Fix)
function checkStatus() {
    const searchUHID = document.getElementById('checkUHID').value;
    const resultDisplay = document.getElementById('statusResult');

    if (!searchUHID) {
        alert("Please enter a UHID.");
        return;
    }

    resultDisplay.innerText = "Searching...";

    // We removed .orderBy() to prevent the "Index Required" error.
    // Instead, we get all entries for that UHID and pick the newest one here.
    db.collection("grievances")
      .where("uhid", "==", searchUHID)
      .get()
      .then((querySnapshot) => {
          if (!querySnapshot.empty) {
              let docs = [];
              querySnapshot.forEach(doc => docs.push(doc.data()));
              
              // Sort by timestamp manually to get the latest
              docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
              let latestDoc = docs[0];

              let statusColor = "#e67e22"; 
              if(latestDoc.status === "Resolved") statusColor = "#27ae60";
              if(latestDoc.status === "Under Review") statusColor = "#2980b9";

              resultDisplay.innerHTML = `
                <div style="margin-top:15px; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; border-left: 5px solid ${statusColor};">
                    <strong style="display:block; color:#333;">Status: <span style="color:${statusColor};">${latestDoc.status}</span></strong>
                    <small>Dept: ${latestDoc.department}</small><br>
                    <small style="color: #888;">Updated: ${latestDoc.timestamp ? latestDoc.timestamp.toDate().toLocaleDateString() : 'Processing'}</small>
                </div>`;
          } else {
              resultDisplay.innerHTML = "<div style='color:red; margin-top:15px;'>No record found for this UHID.</div>";
          }
      })
      .catch((err) => {
          resultDisplay.innerText = "Error connecting to database.";
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
    
    if(val.includes("timing") || val.includes("opd")) response = "OPD timings are 9:00 AM to 5:00 PM, Mon-Sat.";
    if(val.includes("billing")) response = "Billing is on the Ground Floor near the main exit.";
    if(val.includes("status")) response = "Enter your UHID in the status box to track your complaint!";

    setTimeout(() => {
        content.innerHTML += `<p style="color:#00668c;"><strong>AI:</strong> ${response}</p>`;
        content.scrollTop = content.scrollHeight;
    }, 500);
    input.value = "";
}
