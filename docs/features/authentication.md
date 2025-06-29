# Authentication System

## Overview

RegIntel uses a secure, session-based authentication system designed for single-user private deployment. The system prevents multiple user registrations after the initial setup.

## Features

- **Single User System**: Only one user can register (first-come basis)
- **Secure Password Storage**: Bcrypt with 12 salt rounds
- **Session Management**: Iron-session for secure, encrypted cookies
- **Protected Routes**: Middleware-based route protection
- **Strong Password Requirements**: Enforced via Zod validation

## Implementation Details

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Session Configuration
- Cookie-based sessions with httpOnly flag
- 7-day session duration
- Encrypted session data
- Secure cookies in production

### API Endpoints

#### POST /api/auth/register
Creates the initial user account. Returns 403 if a user already exists.

#### POST /api/auth/login
Authenticates user and creates session.

#### POST /api/auth/logout
Destroys current session.

#### GET /api/auth/me
Returns current authenticated user information.

### Route Protection

The middleware automatically:
- Redirects unauthenticated page requests to /login
- Returns 401 for unauthenticated API requests
- Allows access to public routes (/login, /register)

### Client-Side Hook

The `useAuth` hook provides:
- Current user information
- Authentication status
- Logout functionality
- Session refresh capability

## Security Considerations

1. **Environment Variables**: AUTH_SECRET must be set in production
2. **HTTPS Required**: Secure cookies require HTTPS in production
3. **Session Encryption**: All session data is encrypted
4. **Password Hashing**: Passwords are never stored in plain text
5. **Input Validation**: All inputs are validated with Zod schemas

## Usage Example

```typescript
// In a component
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user.email}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```