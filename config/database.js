require ('dotenv').config();
const mongoose = require ('mongoose');

const connectDatabase = async () => {
  //Connect to MongoDB
  mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.9ynsuyw.mongodb.net/${process.env.MONGODB_DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
      console.log('MongoDB connected')
    })
    .catch((err) => {
      console.log(err);
    })
}

module.exports = connectDatabase;