const mongoose = require('mongoose')

const cycleSchema = new mongoose.Schema({

  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },

  name: {
    type: String,
    trim: true
  },

  slug: {
    type: String
  }

}, { timestamps: true })



const Cycle = mongoose.model('Cycle', cycleSchema)
module.exports = Cycle