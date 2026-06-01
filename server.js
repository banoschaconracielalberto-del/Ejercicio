const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

if (!process.env.ADMIN_TOKEN) {
  console.warn('⚠️ ADMIN_TOKEN no está configurado. Revisa api-app/.env o la variable de entorno del servidor.');
}

const app = express();

// Configuración CORS mejorada
const corsOptions = {
  origin: '*', // Permite todas las origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Connect to MongoDB with improved options
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está configurada en .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });
    
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    console.log('\n💡 Soluciones:');
    console.log('   1. Para MongoDB local: MONGODB_URI=mongodb://localhost:27017/restaurantDB');
    console.log('   2. Para MongoDB Atlas: MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/restaurantDB');
    console.log('\n📋 Archivo .env ubicado en:', process.cwd() + '/.env');
    
    // Reintentar conexión cada 5 segundos
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Routes
const reservasRouter = require('./routes/reservas');
app.use('/api/reservas', reservasRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔗 CORS habilitado para todas las origins`);
  });
}

module.exports = app;