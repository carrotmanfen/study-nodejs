require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
const mongoURI = process.env.DATABASE_URL;
const port = process.env.PORT || 3000;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'User API',
        version: '1.0.0',
        description: 'API for managing users',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{
        bearerAuth: []
      }]
    },
    apis: ['./routes/*.js'], // Path to the API docs
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use('/users', userRoutes);
  app.use('/auth', loginRoutes);
  app.use(cors());
  app.listen(port, () => {
    console.log('Server is running on port 3000');
  });