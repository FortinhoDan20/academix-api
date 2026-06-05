const mongoose = require('mongoose')


const classRoomSchema = new mongoose.Schema({

    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    },
    cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cycle",
        required: true
    },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    default: null
  },

  optionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option",
    default: null
  },
    name: String,
    nombrePlace: Number,

}, { timestamps: true })

const Classroom = mongoose.model('Classroom', classRoomSchema)
module.exports = Classroom