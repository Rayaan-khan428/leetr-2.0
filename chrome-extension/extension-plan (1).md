# LeetTracker Chrome Extension Implementation Plan

## Project Setup

### Tech Stack
- TypeScript
- React
- Tailwind CSS
- Manifest V3
- Vite for building

### Project Structure
```
extension/
├── src/
│   ├── background/
│   │   ├── index.ts
│   │   └── auth.ts
│   ├── content/
│   │   ├── problemDetector.ts
│   │   └── submissionTracker.ts
│   ├── popup/
│   │   ├── components/
│   │   │   ├── ProblemForm.tsx
│   │   │   └── SubmissionStatus.tsx
│   │   └── App.tsx
│   └── utils/
│       ├── storage.ts
│       └── api.ts
├── public/
│   └── manifest.json
└── package.json
```

## Implementation Steps

### 1. Initial Setup (1 day)

#### Manifest Configuration
```json
{
  "manifest_version": 3,
  "name": "LeetTracker",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://leetcode.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://leetcode.com/problems/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

### 2. Authentication Integration (2 days)

#### Token Storage
```typescript
// utils/storage.ts
export class TokenStorage {
  static async setToken(token: string): Promise<void> {
    await chrome.storage.local.set({ authToken: token });
  }

  static async getToken(): Promise<string | null> {
    const result = await chrome.storage.local.get('authToken');
    return result.authToken || null;
  }

  static async removeToken(): Promise<void> {
    await chrome.storage.local.remove('authToken');
  }
}
```

#### Authentication Service
```typescript
// utils/auth.ts
export class AuthService {
  static async login(email: string, password: string): Promise<void> {
    const response = await fetch('${API_URL}/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');
    
    const { token } = await response.json();
    await TokenStorage.setToken(token);
  }

  static async logout(): Promise<void> {
    await TokenStorage.removeToken();
  }
}
```

### 3. Problem Detection System (2 days)

#### Problem Detector
```typescript
// content/problemDetector.ts
export class ProblemDetector {
  static getProblemDetails(): ProblemDetails {
    const title = document.querySelector('[data-cy="question-title"]')?.textContent;
    const difficulty = document.querySelector('[diff]')?.getAttribute('diff');
    const url = window.location.href;

    return {
      title: title || 'Unknown Problem',
      difficulty: this.normalizeDifficulty(difficulty),
      url,
      timestamp: new Date().toISOString()
    };
  }

  static watchForSubmission(): void {
    const observer = new MutationObserver(this.handleDOMChange.bind(this));
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private static handleDOMChange(mutations: MutationRecord[]): void {
    // Implementation for detecting successful submission
  }
}
```

### 4. Popup UI Implementation (2 days)

#### Popup Component
```typescript
// popup/App.tsx
import React, { useState, useEffect } from 'react';
import { ProblemForm } from './components/ProblemForm';
import { SubmissionStatus } from './components/SubmissionStatus';

export const App: React.FC = () => {
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    getCurrentProblem();
  }, []);

  return (
    <div className="w-96 p-4">
      {!isAuthenticated ? (
        <LoginForm onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <>
          <ProblemForm initialData={problemDetails} />
          <SubmissionStatus />
        </>
      )}
    </div>
  );
};
```

### 5. Background Service Implementation (1 day)

#### Background Service
```typescript
// background/index.ts
chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension settings
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SUBMISSION_DETECTED':
      handleSubmission(message.data);
      break;
    case 'AUTH_STATUS':
      checkAuthStatus().then(sendResponse);
      return true;
  }
});

async function handleSubmission(data: SubmissionData): Promise<void> {
  const token = await TokenStorage.getToken();
  if (!token) return;

  // Send submission to backend
  await fetch('${API_URL}/problems/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}
```

### 6. Testing Strategy (1 day)

#### Unit Tests
```typescript
// __tests__/problemDetector.test.ts
describe('ProblemDetector', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div data-cy="question-title">Two Sum</div>';
  });

  test('extracts problem title correctly', () => {
    const details = ProblemDetector.getProblemDetails();
    expect(details.title).toBe('Two Sum');
  });
});
```

#### E2E Tests
```typescript
// e2e/submission.test.ts
describe('Submission Flow', () => {
  test('detects successful submission', async () => {
    // Setup and execution steps
  });
});
```

## Security Considerations

### 1. Token Storage
- Use chrome.storage.local for secure token storage
- Clear tokens on logout
- Implement token refresh mechanism

### 2. API Communication
- Use HTTPS only
- Implement proper error handling
- Add request timeout
- Validate responses

### 3. Content Script Security
- Sanitize data before processing
- Validate DOM mutations
- Handle edge cases

## Development Guidelines

### 1. Code Organization
- Use TypeScript for all components
- Implement proper error boundaries
- Use React.Suspense for loading states
- Follow clean code principles

### 2. State Management
- Use React hooks for local state
- Implement proper state persistence
- Handle background/popup communication

### 3. Performance
- Optimize content script injection
- Minimize storage operations
- Implement proper caching
- Use event delegation where appropriate

## Deployment Checklist
- [ ] Test in different Chrome versions
- [ ] Verify manifest permissions
- [ ] Check resource optimization
- [ ] Prepare store listing
- [ ] Create promotional material
- [ ] Set up analytics tracking
- [ ] Prepare documentation
- [ ] Plan update strategy

## Monitoring and Maintenance
1. Implement error tracking
2. Set up usage analytics
3. Monitor performance metrics
4. Track API usage
5. Plan regular updates

## Future Enhancements
1. Offline support
2. Sync across devices
3. Integration with more coding platforms
4. Advanced statistics
5. Custom themes
