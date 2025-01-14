// popup.html
<!DOCTYPE html>
<html>
<head>
  <title>LeetCode Tracker</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
  <style>
    body {
      width: 400px;
      background: #fafafa;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont;
    }

    .btn {
      @apply px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200;
    }

    .btn-complexity {
      @apply px-3 py-2 text-sm font-medium rounded-lg transition-all;
      @apply border border-gray-200 bg-white hover:bg-gray-50;
      @apply text-gray-700 hover:text-gray-900;
    }

    .btn-complexity.selected {
      @apply bg-blue-50 text-blue-700 border-blue-200;
      @apply ring-2 ring-blue-500 ring-opacity-50;
    }

    .input-area {
      @apply w-full px-3 py-2.5 text-sm rounded-lg border;
      @apply bg-white border-gray-200;
      @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
      @apply placeholder-gray-400;
    }

    .card {
      @apply bg-white rounded-xl border border-gray-200;
      @apply shadow-sm hover:shadow-md transition-shadow duration-200;
    }
  </style>
</head>
<body class="p-6 space-y-6">
  <!-- Header Card -->
  <div class="card p-4">
    <div id="problemInfo" class="space-y-2">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
        <h2 class="text-lg font-semibold text-gray-900">LeetCode Problem Tracker</h2>
      </div>
      <p class="text-sm text-gray-500">Track your problem-solving journey</p>
    </div>
  </div>

  <!-- Main Form -->
  <div class="space-y-5">
    <!-- Time Complexity -->
    <div class="space-y-3">
      <label class="block text-sm font-medium text-gray-700">Time Complexity</label>
      <div class="grid grid-cols-3 gap-2" id="timeComplexity">
        <button class="btn-complexity" data-value="O(1)">O(1)</button>
        <button class="btn-complexity" data-value="O(log n)">O(log n)</button>
        <button class="btn-complexity" data-value="O(n)">O(n)</button>
        <button class="btn-complexity" data-value="O(n log n)">O(n log n)</button>
        <button class="btn-complexity" data-value="O(n²)">O(n²)</button>
        <button class="btn-complexity" data-value="O(2ⁿ)">O(2ⁿ)</button>
      </div>
    </div>

    <!-- Space Complexity -->
    <div class="space-y-3">
      <label class="block text-sm font-medium text-gray-700">Space Complexity</label>
      <div class="grid grid-cols-3 gap-2" id="spaceComplexity">
        <button class="btn-complexity" data-value="O(1)">O(1)</button>
        <button class="btn-complexity" data-value="O(log n)">O(log n)</button>
        <button class="btn-complexity" data-value="O(n)">O(n)</button>
        <button class="btn-complexity" data-value="O(n log n)">O(n log n)</button>
        <button class="btn-complexity" data-value="O(n²)">O(n²)</button>
        <button class="btn-complexity" data-value="O(2ⁿ)">O(2ⁿ)</button>
      </div>
    </div>

    <!-- Solution -->
    <div class="space-y-3">
      <label class="block text-sm font-medium text-gray-700">Solution Approach</label>
      <textarea
        id="solution"
        class="input-area min-h-[120px] resize-none"
        placeholder="Describe your solution approach..."
      ></textarea>
    </div>

    <!-- Submit Button -->
    <button id="submit" class="w-full btn bg-blue-600 text-white hover:bg-blue-700">
      Save Problem
    </button>

    <!-- Error Message -->
    <div id="error" class="text-sm text-red-600 hidden"></div>

    <!-- Success Message -->
    <div id="success" class="text-sm text-green-600 hidden"></div>
  </div>

  <script src="popup.js"></script>
</body>
</html>

// popup.js
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
  }

  function updateProblemInfo(info) {
    const { problemName } = info;
    document.querySelector('#problemInfo h2').textContent = problemName || 'LeetCode Problem Tracker';
    document.querySelector('#problemInfo p').textContent = problemName 
      ? 'Track your solution details'
      : 'Please open a LeetCode problem page';
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

  // Get problem info from URL
  chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
    const url = tabs[0].url;
    if (!url?.includes('leetcode.com/problems/')) {
      updateProblemInfo({});
      return;
    }

    const problemName = url.split('/problems/')[1].split('/')[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    problemInfo = {
      problemName,
      leetcodeId: url.split('/problems/')[1].split('/')[0],
      url,
      difficulty: 'MEDIUM'
    };

    updateProblemInfo(problemInfo);
  });

  // Handle form submission
  document.getElementById('submit').addEventListener('click', async () => {
    const submitBtn = document.getElementById('submit');
    const solution = document.getElementById('solution').value;
    
    if (!selectedTime || !selectedSpace || !solution) {
      showError('Please fill in all fields');
      return;
    }

    try {
      submitBtn.textContent = 'Saving...';
      submitBtn.disabled = true;

      const cookie = await chrome.cookies.get({
        url: 'http://localhost:3000',
        name: 'auth_token'
      });

      if (!cookie) {
        throw new Error('Please log in to the main app first');
      }

      const response = await fetch('http://localhost:3000/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie.value}`
        },
        body: JSON.stringify({
          ...problemInfo,
          timeComplexity: selectedTime,
          spaceComplexity: selectedSpace,
          solution,
          notes: ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save problem');
      }

      showSuccess('Problem saved successfully!');
      submitBtn.textContent = 'Saved!';
      submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      submitBtn.classList.add('bg-green-600');
      
      setTimeout(() => window.close(), 1000);

    } catch (error) {
      showError(error.message);
      submitBtn.textContent = 'Save Problem';
      submitBtn.disabled = false;
    }
  });
});