// background.js

// Handle messages from the extension's own components
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROBLEM_SOLVED') {
    handleProblemSolved(message.data)
      .then(result => {
        console.log('Problem saved result:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error saving problem:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
  if (message.type === 'GET_LEETCODE_COOKIE') {
    chrome.cookies.get({
      url: 'https://leetcode.com',
      name: 'LEETCODE_SESSION'
    }, (cookie) => {
      sendResponse({ cookie });
    });
    return true; // Keep the message channel open for async response
  }
});

// Handle messages from external websites (our web app)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // Verify sender origin
  if (!sender.origin.match(/^http:\/\/localhost:3000$/)) {
    sendResponse({ error: 'Unauthorized origin' });
    return;
  }

  if (message.type === 'PING') {
    sendResponse({ status: 'ok' });
    return;
  }

  if (message.type === 'GET_LEETCODE_COOKIE') {
    chrome.cookies.get({
      url: 'https://leetcode.com',
      name: 'LEETCODE_SESSION'
    }, (cookie) => {
      sendResponse({ cookie });
    });
    return true; // Keep the message channel open for async response
  }
});

async function handleProblemSolved(data) {
  try {
    // Get auth token for our app
    const authCookie = await chrome.cookies.get({
      url: 'http://localhost:3000',
      name: 'auth_token'
    });

    if (!authCookie) {
      throw new Error('Please log in to the main app first');
    }

    // Get LeetCode session cookie
    const leetcodeCookie = await chrome.cookies.get({
      url: 'https://leetcode.com',
      name: 'LEETCODE_SESSION'
    });

    if (!leetcodeCookie) {
      throw new Error('Please log in to LeetCode first');
    }

    const response = await fetch('http://localhost:3000/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authCookie.value}`,
        'X-Leetcode-Session': leetcodeCookie.value, // Add LeetCode session to headers
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Save failed:', error);
    throw error;
  }
}