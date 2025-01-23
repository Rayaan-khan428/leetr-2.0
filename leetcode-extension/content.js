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

  const data = {
    leetcodeId,
    problemName,
    difficulty,
    url: window.location.href,
    solvedAt: new Date().toISOString()
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
  const widget = document.querySelector('.leetr-widget');
  const existingStatus = widget.querySelector('.leetr-status');
  if (existingStatus) {
    existingStatus.remove();
  }

  const statusDiv = document.createElement('div');
  statusDiv.className = `leetr-${type} leetr-status`;
  statusDiv.textContent = message;
  widget.querySelector('.leetr-content').appendChild(statusDiv);

  setTimeout(() => {
    statusDiv.remove();
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
        <div class="section-title">Space Complexity</div>
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
        <div class="section-title">Solution Approach</div>
        <textarea id="solution" placeholder="Describe your approach..."></textarea>
      </div>

      <button id="submit">Save Solution</button>
      <div id="error" class="status hidden"></div>
      <div id="success" class="status hidden"></div>
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
    const solution = tab.querySelector('#solution').value;
    
    if (!selectedTime || !selectedSpace || !solution) {
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
          solution,
          notes: ''
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