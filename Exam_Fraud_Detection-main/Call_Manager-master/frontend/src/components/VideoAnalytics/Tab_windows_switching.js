

// Tab switch tracking variables
var tabSwitchCount = 0;

// Other window usage tracking variables
var windowSwitchCount = 0;

// Combined violation tracking
var totalViolationCount = 0;
var maxTotalViolations = 10; // Maximum combined violations

// Time tracking for violations
var violationTimestamps = [];
var lastViolationType = null;
var lastViolationTime = null;

// Function to handle violations
function handleViolation(type) {
  const now = new Date();
  
  // Prevent counting rapid repeated events of the same type
  // (sometimes blur/focus can fire multiple times)
  if (lastViolationType === type && lastViolationTime && 
      (now - lastViolationTime) < 1000) {
    return;
  }
  
  lastViolationType = type;
  lastViolationTime = now;
  
  if (type === "tab") {
    tabSwitchCount++;
    windowSwitchCount--;
    totalViolationCount++;
    totalViolationCount--;
    violationTimestamps.push({
      type: "Tab Switch",
      time: now.toLocaleTimeString()
    });
    
    showWarning(`Warning: Tab switch detected! Remaining chances: ${maxTotalViolations - totalViolationCount}`);
  } else if (type === "window") {
    windowSwitchCount++;
    totalViolationCount++;
    violationTimestamps.push({
      type: "Window Switch",
      time: now.toLocaleTimeString()
    });
    
    showWarning(`Warning: Other window usage detected! Remaining chances: ${maxTotalViolations - totalViolationCount}`);
  }

  // Update the violations summary display
  updateViolationsSummary();

  // Check if limits are exceeded
  if (totalViolationCount >= maxTotalViolations) {
    showWarning("You have exceeded the maximum allowed violations. The test will now close.");
    logViolations();
    setTimeout(closeWindow, 2000); // Give time for the user to see the message
  }
}

// function updateStatusUI(type) {
//   if (!statusText) return;
  
//   if (type === "tab") {
//     statusText.textContent = `Tab switch detected (${tabSwitchCount} times). Remaining chances: ${maxTotalViolations - totalViolationCount}`;
//     statusText.style.color = "red";
//   } else if (type === "window") {
//     statusText.textContent = `Window switch detected (${windowSwitchCount} times). Remaining chances: ${maxTotalViolations - totalViolationCount}`;
//     statusText.style.color = "orange";
//   }
  
  // Create or update violations summary if it exists
//   updateViolationsSummary();
// }

// Function to show a warning dialog
function showWarning(message) {
  // alert(message);
}

// Function to create or update a violations summary element
function updateViolationsSummary() {
  let summary = document.getElementById("violations-summary");
  
  if (!summary) {
    summary = document.createElement("div");
    summary.id = "violations-summary";
    summary.style.position = "fixed";
    summary.style.bottom = "10px";
    summary.style.right = "10px";
    summary.style.background = "rgba(255, 255, 255, 0.9)";
    summary.style.padding = "10px";
    summary.style.borderRadius = "5px";
    summary.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    summary.style.maxWidth = "300px";
    summary.style.zIndex = "10000";
    document.body.appendChild(summary);
  }
  
  summary.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #d32f2f;">Violation Summary</h3>
    <div>Tab Switches: <strong>${tabSwitchCount}</strong></div>
    <div>Window Switches: <strong>${windowSwitchCount}</strong></div>
    <div>Total: <strong>${totalViolationCount}/${maxTotalViolations}</strong></div>
  `;
}

// Function to log violations for review
function logViolations() {
  console.log("Violation Log:");
  console.table(violationTimestamps);
  
  // This could be extended to send the data to a server
}

// Function to attempt closing the window
function closeWindow() {
  // Try multiple approaches to close the window
  try {
    // For most modern browsers
    window.close();
    
    // For some browsers that need self targeting
    window.open('', '_self');
    window.close();
    
    // Alternative approach
    window.location.href = "about:blank";
    window.close();
  } catch (e) {
    console.error("Could not close window automatically:", e);
    
    // Show instructions for manual closing
    const closeMessage = document.createElement("div");
    closeMessage.style.position = "fixed";
    closeMessage.style.top = "0";
    closeMessage.style.left = "0";
    closeMessage.style.width = "100%";
    closeMessage.style.height = "100%";
    closeMessage.style.backgroundColor = "rgba(220, 0, 0, 0.9)";
    closeMessage.style.color = "white";
    closeMessage.style.display = "flex";
    closeMessage.style.flexDirection = "column";
    closeMessage.style.justifyContent = "center";
    closeMessage.style.alignItems = "center";
    closeMessage.style.zIndex = "99999";
    
    closeMessage.innerHTML = `
      <h1>Test Terminated</h1>
      <p>You have exceeded the maximum number of violations.</p>
      <p>Please close this window now.</p>
    `;
    
    document.body.appendChild(closeMessage);
  }
}

// Detect tab visibility change
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    handleViolation("tab");
  }
});

// Detect focus loss
window.addEventListener("blur", function () {
  handleViolation("window");
});

//   if (statusText) {
//     statusText.textContent = "You are back to this window.";
//     statusText.style.color = "blue";
//   }
// });

// Initialize the violations summary on page load
window.addEventListener("load", function() {
  // Create initial violations summary
  updateViolationsSummary();
});

// Before the window/tab is closed, log the final violation count
window.addEventListener("beforeunload", function() {
  logViolations();
});
