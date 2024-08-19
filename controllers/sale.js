const Sale = require("../models/sale"); // Importa il modello Sale
const Vehicle = require("../models/vehicle"); // Importa il modello Vehicle

// Funzione per ottenere tutte le vendite
const getAllSales = async (req, res, next) => {
    try {
        // Recupera tutte le vendite dal database
        const sales = await Sale.find({});
        // Restituisce le vendite come risposta JSON
        return res.json(sales);
    } catch (err) {
        // Gestisce eventuali errori e restituisce un errore con stato 500
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per creare una nuova vendita
const createNewSales = async (req, res, next) => {
    try {
        // Cerca il veicolo con il VIN specificato
        const existingVehicle = await Vehicle.findOne({ vin: req.body.vehicle_vin });

        if (!existingVehicle || existingVehicle.status !== "on sale") {
            // Se il veicolo non esiste o non è in vendita, restituisce un errore con stato 403
            return res.status(403).json({ err: "Macchina non esistente o non in vendita" });
        }

        // Crea un nuovo oggetto Sale con i dettagli forniti
        const newSale = new Sale({
            vehicle_vin: req.body.vehicle_vin, // VIN del veicolo venduto
            customer_email: req.body.customer_email, // Email del cliente che acquista
            sale_date: Date.now(), // Data della vendita
            price: req.body.price // Prezzo di vendita
        });

        // Salva la nuova vendita nel database
        const savedSale = await newSale.save();

        // Aggiorna lo stato del veicolo a "venduto" e rimuove l'email del proprietario
        await Vehicle.findOneAndUpdate(
            { vin: req.body.vehicle_vin },
            { status: 'sold', current_owner_email: "" }
        );

        // Restituisce la vendita salvata con stato 201
        return res.status(201).json(savedSale);
    } catch (err) {
        // Gestisce eventuali errori e restituisce un errore con stato 500
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per ottenere il report delle vendite
const getSalesReport = async (req, res, next) => {
    try {
        // Inizializza il filtro delle vendite
        let filter = {};

        // Aggiungi la condizione per la data di inizio se esiste
        if (req.body.startDate) {
            filter.sale_date = { $gte: new Date(req.body.startDate) };
        }

        // Aggiungi la condizione per la data di fine se esiste
        if (req.body.endDate) {
            filter.sale_date = filter.sale_date || {}; // Se `sale_date` non è ancora stato definito, inizializzalo come oggetto vuoto
            filter.sale_date.$lte = new Date(req.body.endDate);
        }

        // Trova le vendite basate sul filtro costruito
        const sales = await Sale.find(filter);

        // Calcola il totale delle vendite
        const totalSales = sales.reduce((acc, sale) => acc + sale.price, 0);

        // Restituisce il report delle vendite e il totale delle vendite
        return res.status(200).json({ sales, totalSales });
    } catch (err) {
        // Gestisce eventuali errori e restituisce un errore con stato 500
        return res.status(500).json({ error: err.message });
    }
};

// Esporta le funzioni del controller
module.exports = {
    getAllSales, // Esporta la funzione per ottenere tutte le vendite
    createNewSales, // Esporta la funzione per creare una nuova vendita
    getSalesReport // Esporta la funzione per ottenere il report delle vendite
};
