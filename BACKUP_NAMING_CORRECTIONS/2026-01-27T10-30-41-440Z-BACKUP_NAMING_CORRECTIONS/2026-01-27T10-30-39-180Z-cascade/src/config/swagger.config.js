/**
 * Swagger/OpenAPI Configuration
 * Configuration complète pour la documentation API automatique
 */

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPOFE Accounting Application API',
      description: 'API complète pour gestion comptable avec authentification sécurisée',
      version: '1.0.0',
      contact: {
        name: 'SPOFE Support',
        email: 'support@spofe.local',
        url: 'https://spofe.local'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development Server'
      },
      {
        url: 'https://api.spofe.local',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'username', 'email', 'role'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'manager', 'accountant'],
              example: 'user'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            isVerified: {
              type: 'boolean',
              example: true
            },
            lastLogin: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'string'
              }
            }
          }
        },
        Company: {
          type: 'object',
          required: ['name', 'registrationNumber'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            name: {
              type: 'string',
              example: 'ACME Corporation'
            },
            registrationNumber: {
              type: 'string',
              example: 'RC001234567'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            phone: {
              type: 'string'
            },
            address: {
              type: 'string'
            },
            city: {
              type: 'string'
            },
            country: {
              type: 'string'
            },
            currency: {
              type: 'string',
              example: 'XOF'
            },
            isActive: {
              type: 'boolean'
            }
          }
        },
        ChartOfAccount: {
          type: 'object',
          required: ['companyId', 'accountNumber', 'accountName', 'accountType'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            companyId: {
              type: 'string',
              format: 'uuid'
            },
            accountNumber: {
              type: 'string',
              example: '1010'
            },
            accountName: {
              type: 'string',
              example: 'Capital'
            },
            accountType: {
              type: 'string',
              enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']
            },
            description: {
              type: 'string'
            }
          }
        },
        JournalEntry: {
          type: 'object',
          required: ['companyId', 'entryNumber', 'entryDate'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            companyId: {
              type: 'string',
              format: 'uuid'
            },
            entryNumber: {
              type: 'string',
              example: 'JE-001'
            },
            entryDate: {
              type: 'string',
              format: 'date'
            },
            description: {
              type: 'string'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'POSTED', 'ARCHIVED']
            },
            totalDebit: {
              type: 'number',
              format: 'decimal'
            },
            totalCredit: {
              type: 'number',
              format: 'decimal'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Create a new user account with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password'],
                  properties: {
                    username: {
                      type: 'string',
                      minLength: 3,
                      maxLength: 30
                    },
                    email: {
                      type: 'string',
                      format: 'email'
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                      description: 'Must contain uppercase, lowercase, number, and special character'
                    },
                    firstName: {
                      type: 'string'
                    },
                    lastName: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User successfully registered',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            400: {
              $ref: '#/components/responses/ValidationError'
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email'
                    },
                    password: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            },
            401: {
              $ref: '#/components/responses/UnauthorizedError'
            }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User logout',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logout successful'
            },
            401: {
              $ref: '#/components/responses/UnauthorizedError'
            }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            401: {
              $ref: '#/components/responses/UnauthorizedError'
            }
          }
        }
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Token refreshed',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            401: {
              $ref: '#/components/responses/UnauthorizedError'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerOptions;
