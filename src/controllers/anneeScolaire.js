const Year = require("../models/anneeScolaire");
const asyncHadler = require("express-async-handler");

 const addYear = asyncHadler(async (req, res) => {
/*   if (req.user.role !== "super_admin") {
        return res.status(403).json({
        error: true,
        message: "Accès refusé",
        });
    } */

    try {
              
        const year = new Year({year: req.body.year } )
        await year.save()

        
        res.status(201).json({
            error: false,
            message: "L'année a été créée avec succès",
            data: year
        })


    } catch (e) {
        console.log(e)
        res.status(500).json({
            error: true,
            message: e.message
        })
    }
}); 

 const getAllYears = asyncHadler(async(req, res) => {

    try {
        const years = await Year.find().sort({ year: -1})

        res.status(200).json({
            error: false,
            data: years
        })
    } catch (e) {
        res.status(500).json({
            error: true,
            message: e.message
        })
    }
}) 

module.exports = {  addYear, getAllYears }