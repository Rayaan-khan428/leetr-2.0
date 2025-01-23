document.addEventListener('DOMContentLoaded', () => {
  let selectedTime = '';
  let selectedSpace = '';
  let problemInfo = {};

  function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 3000);
  }

  function showSuccess(message) {
    const successEl = document.getElementById('success');
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    setTimeout(() => successEl.classList.add('hidden'), 3000);
  }

  function updateProblemInfo(info) {
    const { problemName, difficulty, leetcodeId } = info;
    const titleEl = document.querySelector('#problemInfo h2');
    const detailsEl = document.querySelector('#problemInfo p');
    
    if (problemName) {
      titleEl.textContent = problemName;
      detailsEl.textContent = `${difficulty} • Problem #${leetcodeId}`;
      document.querySelector('.container').classList.remove('no-problem');
    } else {
      titleEl.textContent = 'Leetr';
      detailsEl.textContent = 'Please open a LeetCode problem page';
      document.querySelector('.container').classList.add('no-problem');
    }
  }

  // Add CSS class to handle disabled state
  function updateSubmitButtonState(disabled = false) {
    const submitBtn = document.getElementById('submit');
    submitBtn.disabled = disabled;
    if (disabled) {
      submitBtn.classList.add('disabled');
    } else {
      submitBtn.classList.remove('disabled');
    }
  }

  // Handle complexity button clicks
  ['timeComplexity', 'spaceComplexity'].forEach(groupId => {
    document.getElementById(groupId).addEventListener('click', (e) => {
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

  // Get problem info when popup opens
  chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    const tab = tabs[0];
    
    if (!tab.url || (!tab.url.includes('leetcode.com/problems/'))) {
      updateProblemInfo({});
      updateSubmitButtonState(true);
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PROBLEM_DATA' });
      problemInfo = response;
      updateProblemInfo(problemInfo);
      updateSubmitButtonState(false);
    } catch (error) {
      console.error('Error getting problem data:', error);
      showError('Failed to load problem data. Please refresh the page and try again.');
      updateSubmitButtonState(true);
    }
  });

  // Handle form submission
  document.getElementById('submit').addEventListener('click', async () => {
    const submitBtn = document.getElementById('submit');
    const solution = document.getElementById('solution').value;
    
    if (!selectedTime || !selectedSpace || !solution) {
      showError('Please fill in all fields');
      return;
    }

    if (!problemInfo.leetcodeId) {
      showError('Please open a LeetCode problem page first');
      return;
    }

    try {
      submitBtn.textContent = 'Saving...';
      updateSubmitButtonState(true);

      const cookie = await chrome.cookies.get({
        url: 'http://localhost:3000',
        name: 'auth_token'
      });

      if (!cookie) {
        throw new Error('Please log in to the main app first');
      }

      chrome.runtime.sendMessage({
        type: 'PROBLEM_SOLVED',
        data: {
          ...problemInfo,
          timeComplexity: selectedTime,
          spaceComplexity: selectedSpace,
          solution,
          notes: ''
        }
      }, (response) => {
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }
        
        showSuccess('Problem saved successfully!');
        submitBtn.textContent = 'Saved!';
        submitBtn.classList.add('success');
        
        setTimeout(() => {
          window.close();
        }, 1000);
      });

    } catch (error) {
      console.error('Error:', error);
      showError(error.message);
      submitBtn.textContent = 'Save Solution';
      updateSubmitButtonState(false);
    }
  });
});