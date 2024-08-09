const Sale = require("../models/sale"); // Importa il modello Sale
const Vehicle = require("../models/vehicle"); // Importa il modello Vehicle

// Funzione per ottenere tutte le vendite
const getAllSales = async (req, res, next) => {
    try {
        const sales = await Sale.find({}); // Recupera tutte le vendite dal database
        return res.json(sales); // Restituisce le vendite come risposta JSON
    } catch (err) {
        return res.status(500).json({ error: err.message }); // Gestisce eventuali errori e restituisce un errore con stato 500
    }
};

// Funzione per creare una nuova vendita
const createNewSales = async (req, res, next) => {
    try {
        const existingVehicle = Vehicle.findOne({ vin: req.body.vehicle_vin }); // Cerca il veicolo con il VIN specificato
        if (!existingVehicle || existingVehicle.status !== "on sale") {
            // Se il veicolo non esiste o non è in vendita
            return res.status(403).json({ err: "Macchina non esistente o non in vendita" }); // Restituisce un errore con stato 403
        } else {
            // Se il veicolo esiste ed è in vendita
            const newSale = Sale({
                vehicle_vin: req.body.vehicle_vin, // VIN del veicolo venduto
                customer_email: req.body.customer_email, // Email del cliente che acquista
                sale_date: Date.now(), // Data della vendita
                price: req.body.price // Prezzo di vendita
            });
            const savedSale = await newSale.save(); // Salva la nuova vendita nel database
            await Vehicle.findOneAndUpdate(
                { vin: req.body.vehicle_vin }, 
                { current_owner_email: req.body.customer_email, status: 'sold' }
            ); // Aggiorna lo stato del veicolo a "venduto" e associa l'email del nuovo proprietario
            return res.status(201).json(savedSale); // Restituisce la vendita salvata con stato 201
        }
    } catch (err) {
        return res.status(500).json({ error: err.message }); // Gestisce eventuali errori e restituisce un errore con stato 500
    }
};

module.exports = {
    getAllSales, // Esporta la funzione getAllSales
    createNewSales // Esporta la funzione createNewSales
};
