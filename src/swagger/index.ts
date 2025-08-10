import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from '@/config/envConfig';

const { NODE_ENV, BACKEND_URL } = config;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RushBet Crypto Platform API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for RushBet crypto-based sports betting and casino platform',
    contact: {
      name: 'RushBet Development Team',
      email: 'dev@rushbet.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: BACKEND_URL || 'http://localhost:3008',
      description: NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login/register endpoints',
      },
    },
    schemas: {
      // Common response schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error description',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
            description: 'Error details or validation errors',
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            example: 'field',
          },
          msg: {
            type: 'string',
            example: 'Invalid field value',
          },
          path: {
            type: 'string',
            example: 'email',
          },
          location: {
            type: 'string',
            example: 'body',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and account management endpoints',
    },
    {
      name: 'Users',
      description: 'User profile and account operations',
    },
    {
      name: 'Payments',
      description: 'Deposit and withdrawal operations',
    },
    {
      name: 'Games',
      description: 'Game-related operations',
    },
  ],
};

// Options for swagger-jsdoc
const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    './src/swagger/paths/*.ts', // Path to the API docs
    './src/swagger/schemas/*.ts', // Path to the schema docs
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Setup Swagger UI
export const setupSwagger = (app: Express): void => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; }
    `,
    customSiteTitle: 'RushBet API Documentation',
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger documentation available at: ${BACKEND_URL || 'http://localhost:3008'}/api-docs`);
};

export default swaggerSpec;
