const mongoose = require('mongoose')


const revSchoolSchema = new mongoose.Schema({

    schoolId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "School",
       required: true
     },
    paymentId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Payment",
              required: true
            },
    registerId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Register",
         required: true
       },
    feeConfig: { type: Number, required: true },


}, {
    timestamps: true
})

module.exports = mongoose.model("RevSchool", revSchoolSchema);