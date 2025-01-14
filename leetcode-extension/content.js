// content.js
function getAuthToken() {
    const tokenCookie = document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith('auth_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
  
  function getProblemData() {
    const urlParts = window.location.pathname.split('/');
    const leetcodeId = urlParts[2];
    const editor = document.querySelector('.monaco-editor');
    const solution = editor ? editor.textContent : '';
    const problemName = document.title.split('-')[0].trim();
    const difficultyEl = document.querySelector('[data-difficulty]');
    const difficulty = difficultyEl ? 
      difficultyEl.getAttribute('data-difficulty').toUpperCase() : 
      'MEDIUM';
  
    return {
      leetcodeId,
      problemName,
      difficulty,
      solution,
      url: window.location.href,
      solvedAt: new Date().toISOString(),
      token: getAuthToken()
    };
  }
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PROBLEM_DATA') {
      sendResponse(getProblemData());
    }
    return true; // Keep the message channel open for async responses
  });