const Counter = require('../models/counter')


const generatePaymentNumber = async (schoolId) => {
  const year = new Date().getFullYear().toString();

  const counter = await Counter.findOneAndUpdate(
    { name: "payment", schoolId, year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.seq.toString().padStart(5, "0");

  return `PAY-${year}-${number}`;
};

module.exports = generatePaymentNumber;