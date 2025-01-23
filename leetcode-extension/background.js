// background.js
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
});

async function handleProblemSolved(data) {
  try {
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
        'Authorization': `Bearer ${cookie.value}`,
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