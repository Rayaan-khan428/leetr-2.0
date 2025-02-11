let selectedTime = '';
let selectedSpace = '';
let currentUrl = window.location.href;

function getProblemData() {
  console.log('Starting getProblemData');
  
  // Get problem title
  const titleSelectors = [
    '[data-cy="question-title"]',
    'div[class*="title-"]',
    '.mr-2.text-lg',
    'div[role="heading"]',
    'h4',
  ];

  let problemName = '';
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      problemName = element.textContent.trim();
      console.log('Found problem name:', problemName, 'using selector:', selector);
      break;
    }
  }

  // Get difficulty - Updated selectors based on LeetCode's new UI
  const difficultySelectors = [
    // Look for the Medium/Easy/Hard text in these locations
    '[data-difficulty]',
    '.bg-fill-secondary', // The difficulty badge
    '.rounded-full:not([class*="text-lg"])', // The rounded difficulty badge
    '.inline-flex.items-center.justify-center.text-caption', // New LeetCode UI
    'div[class*="difficulty"]',
    'span[class*="difficulty"]'
  ];

  let difficulty = 'MEDIUM'; // default
  for (const selector of difficultySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const diffText = element.textContent.trim().toUpperCase();
      // Make sure we only get valid difficulty levels
      if (['EASY', 'MEDIUM', 'HARD'].includes(diffText)) {
        difficulty = diffText;
        console.log('Found difficulty:', difficulty, 'using selector:', selector);
        break;
      }
    }
  }

  // Get leetcode ID from URL
  const urlParts = window.location.pathname.split('/');
  const problemIndex = urlParts.indexOf('problems');
  const leetcodeId = problemIndex !== -1 ? urlParts[problemIndex + 1] : '';

  // Get the actual solution code from the editor
  let solution = '';
  try {
    // LeetCode's code editor is typically a Monaco editor
    const editorElement = document.querySelector('.monaco-editor');
    if (editorElement) {
      // Get all text content from the editor
      const codeLines = editorElement.querySelectorAll('.view-line');
      solution = Array.from(codeLines)
        .map(line => line.textContent)
        .join('\n')
        .trim();
    }
  } catch (error) {
    console.error('Error getting solution:', error);
  }

  const data = {
    leetcodeId,
    problemName,
    difficulty,
    url: window.location.href,
    solvedAt: new Date().toISOString(),
    solution // Add the actual code solution
  };

  console.log('Problem data collected:', data);
  return data;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PROBLEM_DATA') {
    console.log('Received GET_PROBLEM_DATA request');
    const data = getProblemData();
    console.log('Sending response:', data);
    sendResponse(data);
  }
  return true;
});

function showStatus(message, type = 'error') {
  let widget = document.querySelector('.leetr-widget');
  
  // If widget doesn't exist, create it
  if (!widget) {
    widget = document.createElement('div');
    widget.className = 'leetr-widget';
    const content = document.createElement('div');
    content.className = 'leetr-content';
    widget.appendChild(content);
    document.body.appendChild(widget);
  }

  const content = widget.querySelector('.leetr-content');
  const existingStatus = content.querySelector('.leetr-status');
  if (existingStatus) {
    existingStatus.remove();
  }

  const statusDiv = document.createElement('div');
  statusDiv.className = `leetr-${type} leetr-status`;
  statusDiv.textContent = message;
  content.appendChild(statusDiv);

  setTimeout(() => {
    if (statusDiv && statusDiv.parentNode) {
      statusDiv.remove();
    }
  }, 3000);
}

function createTrackerTab() {
  const tab = document.createElement('div');
  tab.className = 'leetcode-tracker-tab';
  
  tab.innerHTML = `
    <div class="tab-toggle">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="tab-toggle-text">Leetr</span>
    </div>
    
    <div class="tracker-header">
      <div class="problem-info">
        <div class="problem-title">Loading...</div>
        <div class="problem-details">Please wait...</div>
      </div>
    </div>

    <div class="tracker-content">
      <div class="section">
        <div class="section-title">Time Complexity</div>
        <div id="timeComplexity" class="complexity-grid">
          <button class="btn-complexity" data-value="O(1)">O(1)</button>
          <button class="btn-complexity" data-value="O(log n)">O(log n)</button>
          <button class="btn-complexity" data-value="O(n)">O(n)</button>
          <button class="btn-complexity" data-value="O(n log n)">O(n log n)</button>
          <button class="btn-complexity" data-value="O(n²)">O(n²)</button>
          <button class="btn-complexity" data-value="O(2ⁿ)">O(2ⁿ)</button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Space Retard Complexity</div>
        <div id="spaceComplexity" class="complexity-grid">
          <button class="btn-complexity" data-value="O(1)">O(1)</button>
          <button class="btn-complexity" data-value="O(log n)">O(log n)</button>
          <button class="btn-complexity" data-value="O(n)">O(n)</button>
          <button class="btn-complexity" data-value="O(n log n)">O(n log n)</button>
          <button class="btn-complexity" data-value="O(n²)">O(n²)</button>
          <button class="btn-complexity" data-value="O(2ⁿ)">O(2ⁿ)</button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Notes</div>
        <textarea id="solution" placeholder="Add your notes about the approach..."></textarea>
      </div>

      <button id="submit">Save Solution</button>
      <div id="error" class="status hidden"></div>
      <div id="success" class="status hidden"></div>

      <!-- Add debug button -->
      <button id="debugButton" style="margin-top: 8px; font-size: 12px; padding: 4px 8px; background: transparent; border: 1px dashed rgba(24, 118, 255, 0.3); color: #1876ff; width: auto; opacity: 0.7;">Debug: Test Cookie</button>
      <div id="cookieInfo" style="margin-top: 4px; font-size: 10px; font-family: monospace; color: #6b7280; display: none;"></div>
    </div>
  `;

  document.body.appendChild(tab);

  // Toggle functionality
  const toggle = tab.querySelector('.tab-toggle');
  toggle.addEventListener('click', () => {
    tab.classList.toggle('expanded');
    toggle.querySelector('svg').style.transform = tab.classList.contains('expanded') ? 'rotate(180deg)' : '';
  });

  // Initialize all the event listeners from popup.js
  initializeTrackerFunctionality(tab);

  // Add cookie debug functionality
  const debugButton = tab.querySelector('#debugButton');
  const cookieInfo = tab.querySelector('#cookieInfo');
  
  debugButton.addEventListener('click', async () => {
    cookieInfo.style.display = 'block';
    cookieInfo.textContent = 'Checking...';

    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_LEETCODE_COOKIE' });
      
      if (response.cookie) {
        cookieInfo.textContent = `Session: ${response.cookie.value.substring(0, 8)}... (${response.cookie.secure ? 'Secure' : 'Not Secure'}, ${response.cookie.httpOnly ? 'HttpOnly' : 'Not HttpOnly'}, SameSite=${response.cookie.sameSite})`;
        
        // Copy cookie to clipboard
        navigator.clipboard.writeText(response.cookie.value).then(() => {
          showStatus('Cookie copied to clipboard', 'success');
          
          // Hide the cookie info after a delay
          setTimeout(() => {
            cookieInfo.style.display = 'none';
          }, 3000);
        });
      } else {
        cookieInfo.textContent = 'No LeetCode session found. Please log in.';
        setTimeout(() => {
          cookieInfo.style.display = 'none';
        }, 3000);
      }
    } catch (error) {
      cookieInfo.textContent = `Error: ${error.message}`;
      console.error('Cookie access error:', error);
      setTimeout(() => {
        cookieInfo.style.display = 'none';
      }, 3000);
    }
  });

  // Start observing URL changes
  observeUrlChanges();
}

// Call this when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createTrackerTab);
} else {
  createTrackerTab();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PROBLEM_DATA') {
    console.log('Received GET_PROBLEM_DATA request');
    const data = getProblemData();
    console.log('Sending response:', data);
    sendResponse(data);
  }
  return true; // Keep the message channel open for async responses
});

function initializeTrackerFunctionality(tab) {
  let selectedTime = '';
  let selectedSpace = '';

  // Handle complexity button clicks
  ['timeComplexity', 'spaceComplexity'].forEach(groupId => {
    tab.querySelector(`#${groupId}`).addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-complexity')) return;
      
      const buttons = e.currentTarget.querySelectorAll('.btn-complexity');
      buttons.forEach(btn => btn.classList.remove('selected'));
      e.target.classList.add('selected');

      if (groupId === 'timeComplexity') {
        selectedTime = e.target.dataset.value;
      } else {
        selectedSpace = e.target.dataset.value;
      }
    });
  });

  // Handle form submission
  tab.querySelector('#submit').addEventListener('click', async () => {
    const submitBtn = tab.querySelector('#submit');
    const notes = tab.querySelector('#solution').value; // This is now notes
    
    if (!selectedTime || !selectedSpace || !notes) {
      showError(tab, 'Please fill in all fields');
      return;
    }

    try {
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      const problemData = getProblemData();
      
      chrome.runtime.sendMessage({
        type: 'PROBLEM_SOLVED',
        data: {
          ...problemData,
          timeComplexity: selectedTime,
          spaceComplexity: selectedSpace,
          notes: notes, // Use the textarea content as notes
          // solution is already included from getProblemData
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          showError(tab, chrome.runtime.lastError.message);
          submitBtn.textContent = 'Save Solution';
          submitBtn.disabled = false;
          return;
        }
        
        showSuccess(tab, 'Problem saved successfully!');
        submitBtn.textContent = 'Saved!';
        submitBtn.classList.add('success');
        
        setTimeout(() => {
          submitBtn.textContent = 'Save Solution';
          submitBtn.disabled = false;
          submitBtn.classList.remove('success');
          tab.querySelector('#solution').value = '';
          tab.querySelectorAll('.btn-complexity').forEach(btn => btn.classList.remove('selected'));
          selectedTime = '';
          selectedSpace = '';
          tab.classList.remove('expanded');
        }, 2000);
      });

    } catch (error) {
      console.error('Error:', error);
      showError(tab, error.message);
      submitBtn.textContent = 'Save Solution';
      submitBtn.disabled = false;
    }
  });

  // Update problem info
  const problemData = getProblemData();
  updateProblemInfo(tab, problemData);
}

function showError(tab, message) {
  const errorEl = tab.querySelector('#error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => errorEl.classList.add('hidden'), 3000);
}

function showSuccess(tab, message) {
  const successEl = tab.querySelector('#success');
  successEl.textContent = message;
  successEl.classList.remove('hidden');
  setTimeout(() => successEl.classList.add('hidden'), 3000);
}

function updateProblemInfo(tab, info) {
  const { problemName, difficulty, leetcodeId } = info;
  const titleEl = tab.querySelector('.problem-title');
  const detailsEl = tab.querySelector('.problem-details');
  
  if (problemName && window.location.href.includes('leetcode.com/problems/')) {
    titleEl.textContent = problemName;
    detailsEl.textContent = `${difficulty} • Problem #${leetcodeId}`;
    tab.style.display = 'flex'; // Show the tracker
  } else {
    titleEl.textContent = 'Leetr';
    detailsEl.textContent = 'Please open a LeetCode problem page';
    tab.style.display = 'none'; // Hide the tracker when not on a problem page
  }
}

// Update the observeUrlChanges function
function observeUrlChanges() {
  setInterval(() => {
    if (currentUrl !== window.location.href) {
      const oldProblemId = getProblemIdFromUrl(currentUrl);
      const newProblemId = getProblemIdFromUrl(window.location.href);
      
      currentUrl = window.location.href;
      
      // Only update if we're on a problem page and the problem ID has changed
      if (currentUrl.includes('leetcode.com/problems/') && oldProblemId !== newProblemId) {
        const tab = document.querySelector('.leetcode-tracker-tab');
        if (tab) {
          const problemData = getProblemData();
          updateProblemInfo(tab, problemData);
          
          // Reset the form
          tab.querySelector('#solution').value = '';
          tab.querySelectorAll('.btn-complexity').forEach(btn => btn.classList.remove('selected'));
          tab.classList.remove('expanded');
        }
      }
    }
  }, 1000);
}

// Add this helper function to extract problem ID from URL
function getProblemIdFromUrl(url) {
  try {
    const match = url.match(/problems\/([^\/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Add styles for the widget
const style = document.createElement('style');
style.textContent = `
  .leetr-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  
  .leetr-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }
  
  .leetr-status {
    padding: 12px 16px;
    margin: 8px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    transition: opacity 0.3s ease;
  }
  
  .leetr-error {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    color: #cf1322;
  }
  
  .leetr-success {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #389e0d;
  }
  
  .leetr-info {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    color: #1890ff;
  }
`;

document.head.appendChild(style);