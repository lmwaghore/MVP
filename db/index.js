const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/spreader');

let simListSchema = mongoose.Schema({
  simName: String,
  
})