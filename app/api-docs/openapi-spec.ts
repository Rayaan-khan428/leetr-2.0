export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Leetr API',
    version: '1.0.0',
    description: 'API documentation For Leetr',
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/api/friends': {
      get: {
        summary: "Get user's friends list",
        description: "Retrieves the authenticated user's friends list with their problem-solving statistics",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of friends retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      friendshipId: { type: 'string' },
                      id: { type: 'string' },
                      displayName: { type: 'string', nullable: true },
                      email: { type: 'string' },
                      photoURL: { type: 'string', nullable: true },
                      problemStats: {
                        type: 'object',
                        properties: {
                          totalProblems: { type: 'number' },
                          easy: { type: 'number' },
                          medium: { type: 'number' },
                          hard: { type: 'number' },
                          recentlySolved: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'No token provided or invalid token' },
          404: { description: 'User not found' },
          500: { description: 'Server error' },
        },
      },
      delete: {
        summary: 'Remove a friend',
        description: 'Removes a friend connection between users',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  friendshipId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Friend removed successfully' },
          401: { description: 'No token provided or invalid token' },
          404: { description: 'Friendship not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/api/friends/requests': {
      get: {
        summary: 'Get friend requests',
        description: 'Retrieves all pending friend requests for the authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Friend requests retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      status: { type: 'string' },
                      sender: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          displayName: { type: 'string', nullable: true },
                          email: { type: 'string' },
                          photoURL: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}; 