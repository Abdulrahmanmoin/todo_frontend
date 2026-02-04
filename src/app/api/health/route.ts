/**
 * Health check endpoint for container orchestration
 * Returns 200 OK when the Next.js application is running
 */
export async function GET() {
  return Response.json(
    {
      status: 'ok',
      message: 'Todo AI Chatbot Frontend is running',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
