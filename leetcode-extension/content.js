let selectedTime = '';
let selectedSpace = '';

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

function createWidget() {
  const widget = document.createElement('div');
  const toggle = document.createElement('div');
  
  // Create toggle button
  toggle.className = 'leetr-toggle';
  toggle.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  `;
  
  // Create main widget
  widget.className = 'leetr-widget';
  widget.innerHTML = `
    <div class="leetr-header">
      <h2 class="leetr-title">LeetCode Tracker</h2>
      <button class="leetr-close-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="leetr-content">
      <div class="leetr-section">
        <label class="leetr-label">Time Complexity</label>
        <div class="leetr-grid" id="timeComplexity">
          <button class="leetr-button" data-value="O(1)">O(1)</button>
          <button class="leetr-button" data-value="O(log n)">O(log n)</button>
          <button class="leetr-button" data-value="O(n)">O(n)</button>
          <button class="leetr-button" data-value="O(n log n)">O(n log n)</button>
          <button class="leetr-button" data-value="O(n²)">O(n²)</button>
          <button class="leetr-button" data-value="O(2ⁿ)">O(2ⁿ)</button>
        </div>
      </div>
      
      <div class="leetr-section">
        <label class="leetr-label">Space Complexity</label>
        <div class="leetr-grid" id="spaceComplexity">
          <button class="leetr-button" data-value="O(1)">O(1)</button>
          <button class="leetr-button" data-value="O(log n)">O(log n)</button>
          <button class="leetr-button" data-value="O(n)">O(n)</button>
          <button class="leetr-button" data-value="O(n log n)">O(n log n)</button>
          <button class="leetr-button" data-value="O(n²)">O(n²)</button>
          <button class="leetr-button" data-value="O(2ⁿ)">O(2ⁿ)</button>
        </div>
      </div>

      <div class="leetr-section">
        <label class="leetr-label">Solution Approach</label>
        <textarea class="leetr-textarea" placeholder="Describe your approach..."></textarea>
      </div>

      <div class="leetr-section">
        <button class="leetr-submit">Save Solution</button>
      </div>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(widget);

  // Add event listeners
  toggle.addEventListener('click', () => {
    widget.classList.toggle('open');
    toggle.style.display = 'none';
  });

  widget.querySelector('.leetr-close-btn').addEventListener('click', () => {
    widget.classList.remove('open');
    toggle.style.display = 'flex';
  });

  // Handle complexity button selections
  ['timeComplexity', 'spaceComplexity'].forEach(id => {
    const container = widget.querySelector(`#${id}`);
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('leetr-button')) {
        container.querySelectorAll('.leetr-button').forEach(btn => {
          btn.classList.remove('selected');
        });
        e.target.classList.add('selected');
        
        // Store selected values
        if (id === 'timeComplexity') {
          selectedTime = e.target.dataset.value;
        } else {
          selectedSpace = e.target.dataset.value;
        }
      }
    });
  });

  // Add submit handler
  widget.querySelector('.leetr-submit').addEventListener('click', async () => {
    const submitBtn = widget.querySelector('.leetr-submit');
    const solution = widget.querySelector('.leetr-textarea').value;

    if (!selectedTime || !selectedSpace || !solution) {
      showStatus('Please fill in all fields');
      return;
    }

    // Update this part in content.js inside the submit click handler
try {
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;

  const problemData = getProblemData();
  
  // Send message to background script
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
      console.error('Runtime error:', chrome.runtime.lastError);
      showStatus(chrome.runtime.lastError.message);
      submitBtn.textContent = 'Save Solution';
      submitBtn.disabled = false;
      return;
    }
    
    if (response && response.error) {
      showStatus(response.error);
      submitBtn.textContent = 'Save Solution';
      submitBtn.disabled = false;
      return;
    }
    
    submitBtn.textContent = 'Saved!';
    submitBtn.classList.add('success');
    showStatus('Problem saved successfully!', 'success');
    
    // Reset form after success
    setTimeout(() => {
      submitBtn.textContent = 'Save Solution';
      submitBtn.disabled = false;
      submitBtn.classList.remove('success');
      widget.querySelector('.leetr-textarea').value = '';
      selectedTime = '';
      selectedSpace = '';
      widget.querySelectorAll('.leetr-button').forEach(btn => {
        btn.classList.remove('selected');
      });
      widget.classList.remove('open');
      toggle.style.display = 'flex';
    }, 2000);
  });

} catch (error) {
  console.error('Error:', error);
  submitBtn.textContent = 'Save Solution';
  submitBtn.disabled = false;
  showStatus(error.message);
}
  });
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

// Initialize widget when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createWidget);
} else {
  createWidget();
}