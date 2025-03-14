import { NextResponse } from 'next/server';

export async function POST(request) {
  // Create a response object
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Delete the 'token' cookie by setting it to an empty value and expiring it
  response.cookies.set('token', '', {
    expires: new Date(0), // Set expiration date to the past
    path: '/', // Ensure the cookie is deleted for the entire site
  });

  return response;
}