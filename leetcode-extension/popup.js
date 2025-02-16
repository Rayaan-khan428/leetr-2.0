// Constants
const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_URL = 'http://localhost:3000';
const MAX_RATING_STARS = 5;

// SVG Icons
const STAR_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
</svg>`;

// Helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const createRatingStars = (rating) => {
  const normalizedRating = Math.round((rating || 0) / 10 * MAX_RATING_STARS);
  return Array(MAX_RATING_STARS)
    .fill('')
    .map((_, i) => `<span class="star${i >= normalizedRating ? ' empty' : ''}">${STAR_SVG}</span>`)
    .join('');
};

const generateProblemHTML = (problem, solvedData) => `
  <div class="problem-info">
    <div class="problem-header">
      <div class="problem-title-section">
        <div class="problem-title">${problem.problemName}</div>
        <div class="problem-id">Problem #${problem.numericalId}</div>
      </div>
      <div class="difficulty-badge ${problem.difficulty}">
        ${problem.difficulty.toLowerCase()}
      </div>
    </div>
    ${solvedData ? generateSolvedDataHTML(solvedData) : generateNotSolvedHTML()}
  </div>
`;

const generateSolvedDataHTML = (data) => `
  <div class="solved-badge">
    Solved ${formatDate(data.solvedAt)}
  </div>

  <div class="stats-grid">
    <div class="stat-item">
      <div class="stat-label">Attempts</div>
      <div class="stat-value">${data.attempts}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Rating</div>
      <div class="rating-stars">${createRatingStars(data.difficultyRating)}</div>
    </div>
  </div>

  <div class="complexity-section">
    <div class="complexity-item">
      <div class="complexity-label">Time</div>
      <div class="complexity-value">${data.timeComplexity || 'N/A'}</div>
    </div>
    <div class="complexity-item">
      <div class="complexity-label">Space</div>
      <div class="complexity-value">${data.spaceComplexity || 'N/A'}</div>
    </div>
  </div>

  <div class="notes-section">
    <div class="notes-label">Notes</div>
    <div class="notes-content">
      ${data.notes || 'No notes added'}
    </div>
  </div>
`;

const generateNotSolvedHTML = () => `
  <div class="notes-section">
    <div class="notes-content not-found">
      You haven't solved this problem yet
    </div>
  </div>
`;

const generateErrorHTML = () => `
  <div class="notes-section">
    <div class="notes-content error">
      Error fetching problem notes
    </div>
  </div>
`;

// Main functionality
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get auth cookie
    const cookie = await chrome.cookies.get({
      url: AUTH_URL,
      name: AUTH_COOKIE_NAME
    });

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Only proceed if we're on a LeetCode problem page
    if (!tab.url.includes('leetcode.com/problems/')) {
      return;
    }

    // Get problem data from content script
    chrome.tabs.sendMessage(tab.id, { type: 'GET_PROBLEM_DATA' }, async (response) => {
      if (chrome.runtime.lastError || !response?.problemName || !response?.numericalId) {
        return;
      }

      const content = document.getElementById('content');

      // If not authenticated, just show problem info
      if (!cookie?.value) {
        content.innerHTML = generateProblemHTML(response);
        return;
      }

      try {
        // Fetch solved data from our database
        const problemResponse = await fetch(
          `${AUTH_URL}/api/problems/search?leetcodeId=${response.numericalId}`,
          {
            headers: { 'Authorization': `Bearer ${cookie.value}` }
          }
        );

        // Generate HTML based on whether problem was found
        content.innerHTML = generateProblemHTML(
          response,
          problemResponse.ok ? await problemResponse.json() : null
        );
      } catch (error) {
        content.innerHTML = generateProblemHTML(response);
        const problemInfo = content.querySelector('.problem-info');
        problemInfo.innerHTML += generateErrorHTML();
      }
    });
  } catch (error) {
    console.error('Error in popup initialization:', error);
  }
}); 