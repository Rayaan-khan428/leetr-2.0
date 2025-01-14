chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PROBLEM_SOLVED') {
      handleProblemSolved(message.data, message.token);
    }
  });
  
  async function handleProblemSolved(data, token) {
    if (!token) {
      console.error('No auth token available');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log('Problem saved successfully');
    } catch (error) {
      console.error('Error saving problem:', error);
    }
  }