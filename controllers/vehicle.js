const Vehicle = require("../models/vehicle")
const User = require("../models/user")

const getAllVehicles = async (req, res, next) => {
    try{
        const vehicles = await Vehicle.find({})
        return res.json(vehicles)
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

const getAllOnSaleVehicles = async (req, res, next) => {
    try{
        const vehicles = await Vehicle.find({ status : 'on sale'})
        return res.json(vehicles)
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

const getAllUnderMaintenanceVehicles = async (req, res, next) => {
    try{
        const vehicles = await Vehicle.find({ status : 'under maintenance'})
        return res.json(vehicles)
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

const createNewVehicle = async (req, res, next) => {
    try {
        // Controlla se il veicolo esiste già
        const existingVehicle = await Vehicle.findOne({ vin: req.body.vin });
        if (existingVehicle) {
            return res.status(400).json({ message: "Veicolo già esistente" });
        }

        // Controlla se l'utente richiedente è un amministratore o un cliente
        const requester_email = req.body.requester_email;

        const requester = await User.findOne({ email: requester_email, role: 'admin' });
        if (!requester) {
            const requester2 = await User.findOne({ email: requester_email, role: 'customer' });
            if (!requester2) {
                return res.status(404).json({ message: "Utente non esistente" });
            } else {
                return res.status(403).json({ message: "Non autorizzato: verifica per i clienti da completare" });
            }
        }

        // Crea un nuovo veicolo
        const newVehicle = new Vehicle({
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            vin: req.body.vin,
            status: req.body.status || "",
            current_owner_email: req.body.current_owner_email || ""
        });

        // Salva il nuovo veicolo
        const savedVehicle = await newVehicle.save();
        return res.status(201).json(savedVehicle);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

// Esporta le funzioni come modulo
module.exports = {
    getAllVehicles,
    getAllOnSaleVehicles,
    getAllUnderMaintenanceVehicles,
    createNewVehicle
};
