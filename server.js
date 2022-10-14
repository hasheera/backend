const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is up and running at port ${port}`.cyan));
