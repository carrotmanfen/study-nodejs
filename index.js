const userRoutes = require('./routes/userRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
const mongoURI = 'mongodb://localhost:27017/nodejs-mongodb';

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
    },
    apis: ['./routes/*.js'], // Path to the API docs
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use('/users', userRoutes);
  app.use(cors());
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });