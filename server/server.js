require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const port = Number(process.env.PORT || 5000);

async function start() {
  try {
    await testConnection();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

start();

