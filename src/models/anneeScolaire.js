const mongoose = require('mongoose')


const yearSchema = new mongoose.Schema({

    year: {
        type: String,
        require: true
    },
    current: {
        type: Boolean,
        default: true
    }
})

const Year = mongoose.model('Year', yearSchema)
module.exports = Year