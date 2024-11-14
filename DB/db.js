const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGODB_URL).then(()=> console.log('mongodb connection established'))
.catch(()=> console.log('mongodb connection aborted'));
const stockSchema = new mongoose.Schema({
    symbol: String,
    data: Schema.Types.Mixed
});

// Create a model for the schema
const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;