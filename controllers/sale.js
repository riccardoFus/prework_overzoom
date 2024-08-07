const Sale = require("../models/sale")
const Vehicle = require("../models/vehicle")

const getAllSales = async (req, res, next) => {
    try{
        const sales = await Sale.find({})
        return res.json(sales)
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

const createNewSales = async (req, res, next) => {
    try {
        const existingVehicle = Vehicle.findOne({vin: req.body.vehicle_vin})
        if(!existingVehicle || existingVehicle.status !== "on sale"){
            return res.status(403).json({err: "Macchina non esistente o non in vendita"})
        }else{
            // check user
            const newSale = Sale({
                vehicle_vin: req.body.vehicle_vin,
                customer_email: req.body.customer_email,
                sale_date: Date.now(),
                price: req.body.price
            })
            const savedSale = await newSale.save()
            await Vehicle.findOneAndUpdate({vin: req.body.vehicle_vin}, {current_owner_email: req.body.customer_email, status: 'sold'})
            return res.status(201).json(savedSale)
        }
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

module.exports = {
    getAllSales,
    createNewSales
}