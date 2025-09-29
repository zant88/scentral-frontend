# Login Credentials for Testing

## Admin Login
- **Email:** `admin@scentral.id`
- **Password:** `password`
- **Redirects to:** `/admin/dashboard`

## Brand Login
- **Email:** `brand@scentral.com`
- **Password:** `password`
- **Redirects to:** `/brand/dashboard`

## Important Notes

1. **Backend Server:** Make sure the backend server is running on `http://localhost:3030`
2. **Frontend Server:** Make sure the frontend server is running on `http://localhost:4000`
3. **Database:** The users are already created in the database

## Testing Steps

1. Open `http://localhost:4000/login` in your browser
2. Use the admin credentials above
3. Click "Sign In"
4. You should be redirected to the admin dashboard

## Troubleshooting

If login still doesn't work:
1. Check browser console for errors
2. Verify backend server is running
3. Check network tab in browser dev tools
4. Ensure the correct email format is used (admin@scentral.id, not admin@scentral.com)