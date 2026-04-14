// Firebase Config
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

// SUBMIT GRIEVANCE
function submitGrievance() {
    const name = document.getElementById('patientName').value;
    const uhid = document.getElementById('uhid').value;
    const dept = document.getElementById('department').value;
    const cat = document.getElementById('category').value;
    const rate = document.getElementById('rating').value;
    const desc = document.getElementById('description').value;

    if (!name || !uhid || !desc) {
        alert("Please provide Name, UHID, and Description.");
        return;
    }

    db.collection("grievances").add({
        patientName: name,
        uhid: uhid,
        department: dept,
        category: cat,
        rating: rate,
        description: desc,
        status: "Pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Success! Management has been notified.");
        location.reload(); // Refresh to clear form
    })
    .catch((err) => alert("Connection error. Check Brave Shields."));
}

// CHECK STATUS (The powerful index-free fix)
function checkStatus() {
    const searchUHID = document.getElementById('checkUHID').value;
    const result = document.getElementById('statusResult');

    if (!searchUHID) return alert("Enter UHID");

    result.innerHTML = "<p style='color: #666;'>Checking secure records...</p>";

    // We ONLY use .where(). This bypasses the Index Requirement.
    db.collection("grievances")
      .where("uhid", "==", searchUHID)
      .get()
      .then((querySnapshot) => {
          if (querySnapshot.empty) {
              result.innerHTML = "<p style='color:red;'>No record found for this UHID.</p>";
              return;
          }

          let logs = [];
          querySnapshot.forEach(doc => logs.push(doc.data()));

          // POWERFUL FIX: We sort the time in the browser, not the database.
          logs.sort((a, b) => {
              const timeA = a.timestamp ? a.timestamp.seconds : 0;
              const timeB = b.timestamp ? b.timestamp.seconds : 0;
              return timeB - timeA;
          });

          const latest = logs[0];
          let color = "#e67e22"; // Orange
          if(latest.status === "Resolved") color = "#27ae60"; // Green
          if(latest.status === "Under Review") color = "#2980b9"; // Blue

          result.innerHTML = `
            <div style="margin-top:15px; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #ddd; border-left: 5px solid ${color};">
                <strong style="color: ${color}; font-size: 16px;">${latest.status}</strong><br>
                <small>Department: ${latest.department}</small>
            </div>`;
      })
      .catch(err => {
          console.log(err);
          result.innerHTML = "<p style='color:red;'>Service temporary unavailable.</p>";
      });
}

// CHATBOT
function toggleChat() {
    const box = document.getElementById('chat-box');
    box.style.display = box.style.display === 'none' ? 'flex' : 'none';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const display = document.getElementById('chat-content');
    if(!input.value) return;

    display.innerHTML += `<p><strong>You:</strong> ${input.value}</p>`;
    let botMsg = "Please contact our help desk at +91-XXXX-XXXXXX for direct assistance.";
    const txt = input.value.toLowerCase();

    if(txt.includes("opd") || txt.includes("time")) botMsg = "OPD hours are 9 AM - 5 PM, Mon to Sat.";
    if(txt.includes("billing")) botMsg = "Billing counters are located on the Ground Floor.";
    if(txt.includes("status")) botMsg = "Use the 'Track My Grievance' box to see updates.";

    setTimeout(() => {
        display.innerHTML += `<p style="color:#00668c;"><strong>AI:</strong> ${botMsg}</p>`;
        display.scrollTop = display.scrollHeight;
    }, 400);
    input.value = "";
}
