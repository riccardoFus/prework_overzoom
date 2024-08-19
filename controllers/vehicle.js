const Vehicle = require("../models/vehicle");
const User = require("../models/user");
const Sale = require("../models/sale");

// Funzione per ottenere tutti i veicoli
const getAllVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({});
        return res.json(vehicles);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per ottenere tutti i veicoli in vendita
const getAllOnSaleVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ status: 'on sale' });
        return res.json(vehicles);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per ottenere tutti i veicoli in manutenzione
const getAllUnderMaintenanceVehicles = async (req, res, next) => {
    try {
        const vehicles = await Vehicle.find({ status: 'under maintenance' });
        return res.json(vehicles);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per creare un nuovo veicolo
const createNewVehicle = async (req, res, next) => {
    try {
        // Controlla se il veicolo esiste già
        const existingVehicle = await Vehicle.findOne({ vin: req.body.vin });

        if (existingVehicle) {
            // Controlla se l'utente richiedente è un amministratore o un cliente
            const requester_email = req.body.requester_email;
            const requester = await User.findOne({ email: requester_email });

            // Verifica se l'utente esiste
            if (!requester) {
                return res.status(404).json({ message: "Utente non esistente" });
            }

            // Se il richiedente è un cliente
            if (requester.role === 'customer') {
                // Verifica se il cliente ha una vendita associata al veicolo
                const existingSale = await Sale.findOne({ customer_email: requester_email });
                if (!existingSale || existingVehicle.current_owner_email) {
                    return res.status(403).json({ message: "Associazione non autorizzata" });
                }

                // Aggiorna l'associazione del veicolo con il cliente
                const updatedVehicle = await Vehicle.findOneAndUpdate(
                    { vin: req.body.vin },
                    { current_owner_email: requester_email },
                    { new: true }
                );
                return res.status(200).json({ message: "Associazione cliente aggiornata correttamente", vehicle: updatedVehicle });
            }

            // Se il richiedente è un amministratore, non fare nulla
            return res.status(403).json({ message: "Associazione non autorizzata per amministratori" });
        }

        // Crea un nuovo veicolo
        const newVehicle = new Vehicle({
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            vin: req.body.vin,
            status: req.body.status || "available",
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
