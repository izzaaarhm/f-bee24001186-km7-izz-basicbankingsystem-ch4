const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Config Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Dokumentasi Banking System',
            version: '1.0.0',
            description: 'Dokumentasi untuk API Banking System',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // utk generate apidocs otomatis, path ke folder routes
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`API Docs tersedia di http://localhost:${port}/api-docs`);
}

// Nyimpen swagger ke file swagger.json
const fs = require('fs');

fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2), 'utf-8');

module.exports = swaggerDocs;
