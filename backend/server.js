const express = require("express");
const connectDB = require('./config/db')
const cors = require('cors');
const port = process.env.PORT ||  5000;


const app = express();
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3001',"https://capraise.netlify.app"],
}));

app.use(express.json())

app.use('/api/v1',require('./route'))


connectDB()


app.listen(port, () => console.log(`Server started on port ${port}`));
