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

function createComplexityTracker() {
  console.log('Attempting to create complexity tracker');
  
  // Check if tracker already exists
  if (document.querySelector('.complexity-tracker')) {
    console.log('Tracker already exists, skipping creation');
    return;
  }

  // Check if we're on a successful submission page
  const submissionResult = document.querySelector('[data-e2e-locator="submission-result"]');
  if (!submissionResult?.textContent?.includes('Accepted')) {
    console.log('Not a successful submission, skipping tracker creation');
    return;
  }

  // Find the parent container with the flex layout
  const parentContainer = document.querySelector('.mx-auto.flex.w-full.max-w-\\[700px\\].flex-col.gap-4');
  if (!parentContainer) {
    console.log('Could not find parent container');
    return;
  }

  const trackerHTML = `
    <div class="flex w-full flex-col gap-2 rounded-lg border p-3 border-border-tertiary dark:border-border-tertiary">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <div class="text-sm font-medium text-label-2 dark:text-dark-label-2">Time & Space Complexity</div>
          <div class="flex-1"></div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <div class="text-xs text-label-3 dark:text-dark-label-3">Time Complexity</div>
            <div class="complexity-grid grid grid-cols-3 gap-2">
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(1)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(log n)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(n)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(n log n)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(n²)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(2ⁿ)</button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="text-xs text-label-3 dark:text-dark-label-3">Space Complexity</div>
            <div class="complexity-grid grid grid-cols-3 gap-2">
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(1)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(log n)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(n)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(n log n)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(n²)</button>
              <button class="btn-complexity rounded px-2 py-1 text-xs border border-border-tertiary hover:border-blue-s dark:border-dark-border-tertiary dark:hover:border-dark-blue-s">O(2ⁿ)</button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="text-xs text-label-3 dark:text-dark-label-3">Notes</div>
          <textarea 
            class="w-full min-h-[80px] rounded-lg px-3 py-2 text-sm resize-none border border-border-tertiary focus:border-blue-s dark:border-dark-border-tertiary dark:focus:border-dark-blue-s bg-overlay-1 dark:bg-dark-overlay-1"
            placeholder="Add your notes about the approach..."
          ></textarea>
        </div>

        <button id="save-complexity" class="w-full rounded-lg bg-green-s text-label-r px-4 py-2 font-medium hover:bg-green-3 dark:hover:bg-dark-green-3">
          Save Solution Details
        </button>
      </div>
    </div>
  `;

  // Create wrapper for tracker
  const trackerWrapper = document.createElement('div');
  trackerWrapper.className = 'complexity-tracker';
  trackerWrapper.innerHTML = trackerHTML;
  
  // Insert the tracker as a child of the parent container
  parentContainer.appendChild(trackerWrapper);
  console.log('Successfully inserted tracker');

  // Initialize the complexity selection functionality
  initializeComplexityTracking(trackerWrapper);
}

function initializeComplexityTracking(container) {
  let selectedTime = '';
  let selectedSpace = '';

  // Handle complexity button clicks
  container.querySelectorAll('.complexity-grid').forEach((grid, index) => {
    grid.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-complexity')) return;
      
      const buttons = grid.querySelectorAll('.btn-complexity');
      buttons.forEach(btn => {
        btn.classList.remove('bg-blue-s', 'text-white');
        btn.classList.add('border-border-tertiary');
      });
      
      e.target.classList.add('bg-blue-s', 'text-white');
      e.target.classList.remove('border-border-tertiary');

      if (index === 0) {
        selectedTime = e.target.textContent;
      } else {
        selectedSpace = e.target.textContent;
      }
    });
  });

  // Handle save button click
  const saveButton = container.querySelector('#save-complexity');
  const notesTextarea = container.querySelector('textarea');

  saveButton.addEventListener('click', async () => {
    if (!selectedTime || !selectedSpace || !notesTextarea.value.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      saveButton.textContent = 'Saving...';
      saveButton.disabled = true;

      const problemData = getProblemData();
      
      chrome.runtime.sendMessage({
        type: 'PROBLEM_SOLVED',
        data: {
          ...problemData,
          timeComplexity: selectedTime,
          spaceComplexity: selectedSpace,
          notes: notesTextarea.value.trim(),
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          alert(chrome.runtime.lastError.message);
          saveButton.textContent = 'Save Solution Details';
          saveButton.disabled = false;
          return;
        }
        
        saveButton.textContent = 'Saved!';
        saveButton.classList.add('bg-green-3');
        
        setTimeout(() => {
          saveButton.textContent = 'Save Solution Details';
          saveButton.disabled = false;
          saveButton.classList.remove('bg-green-3');
          notesTextarea.value = '';
          container.querySelectorAll('.btn-complexity').forEach(btn => {
            btn.classList.remove('bg-blue-s', 'text-white');
            btn.classList.add('border-border-tertiary');
          });
          selectedTime = '';
          selectedSpace = '';
        }, 2000);
      });
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
      saveButton.textContent = 'Save Solution Details';
      saveButton.disabled = false;
    }
  });
}

function initializeTracker() {
  console.log('Initializing tracker...');
  
  // Try to initialize immediately if we're on a submission page with success
  const submissionResult = document.querySelector('[data-e2e-locator="submission-result"]');
  if (submissionResult?.textContent?.includes('Accepted')) {
    console.log('Found accepted submission, creating tracker');
    createComplexityTracker();
  }
  
  // Watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        const submissionResult = document.querySelector('[data-e2e-locator="submission-result"]');
        if (submissionResult?.textContent?.includes('Accepted')) {
          console.log('Detected new accepted submission, creating tracker');
          createComplexityTracker();
          break;
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTracker);
} else {
  initializeTracker();
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
    const notes = tab.querySelector('#solution').value;
    
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
          notes: notes,
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
  const existingStatus = tab.querySelector('.status');
  if (existingStatus) {
    existingStatus.remove();
  }

  const section = tab.querySelector('.section:last-child');
  const statusDiv = document.createElement('div');
  statusDiv.className = 'status leetr-error';
  statusDiv.textContent = message;
  section.appendChild(statusDiv);

  setTimeout(() => {
    statusDiv.remove();
  }, 3000);
}

function showSuccess(tab, message) {
  const existingStatus = tab.querySelector('.status');
  if (existingStatus) {
    existingStatus.remove();
  }

  const section = tab.querySelector('.section:last-child');
  const statusDiv = document.createElement('div');
  statusDiv.className = 'status leetr-success';
  statusDiv.textContent = message;
  section.appendChild(statusDiv);

  setTimeout(() => {
    statusDiv.remove();
  }, 3000);
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