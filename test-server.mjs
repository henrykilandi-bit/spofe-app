import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'Guardian HTTP Mapping Test Server'
    };
});

// Test endpoint for Guardian rejection and success
fastify.post('/api/v1/aggregates', async (request, reply) => {
    const { aggregateId, actorRole } = request.body;
    
    // Validate input
    if (!aggregateId || !actorRole) {
        reply.status(400);
        return {
            error: 'INVALID_INPUT',
            message: 'Missing required fields: aggregateId, actorRole'
        };
    }
    
    // Guardian decision: USER role is rejected with G4-03
    if (actorRole === 'USER') {
        reply.status(403);
        return {
            error: 'IMPLICIT_AUTHORITY',
            message: 'Implicit authority is forbidden',
            violation: 'G4-03',
            description: 'USER role cannot perform this operation without explicit authorization'
        };
    }
    
    // SYSTEM and ADMIN roles are allowed
    if (actorRole === 'SYSTEM' || actorRole === 'ADMIN') {
        reply.status(201);
        return {
            status: 'CREATED',
            aggregateId: aggregateId,
            message: 'Aggregate created successfully',
            createdAt: new Date().toISOString()
        };
    }
    
    // Unknown role
    reply.status(400);
    return {
        error: 'INVALID_ROLE',
        message: `Unknown actor role: ${actorRole}`
    };
});

// 404 handler
fastify.get('/api/v1/nonexistent-resource', async (request, reply) => {
    reply.status(404);
    return {
        error: 'NOT_FOUND',
        message: 'The requested resource was not found',
        path: '/api/v1/nonexistent-resource'
    };
});

// 401 handler for profile endpoint
fastify.get('/api/profile', async (request, reply) => {
    const token = request.headers.authorization;
    
    if (!token) {
        reply.status(401);
        return {
            error: 'UNAUTHORIZED',
            message: 'Authentication token is required'
        };
    }
    
    reply.status(200);
    return {
        profile: 'authenticated user profile'
    };
});

// Start server
const start = async () => {
    try {
        await fastify.listen({ host: '127.0.0.1', port: 3001 });
        console.log('✅ Fastify server listening on http://127.0.0.1:3001');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
