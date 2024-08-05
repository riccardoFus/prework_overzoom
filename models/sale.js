const mongoose = require("mongoose");

// Definizione dello schema per la collezione Sales
const saleSchema = new mongoose.Schema({
    // Campo vehicle_id: stringa richiesta (ID del veicolo venduto)
    vehicle_id: {
        type: String,
        required: true
    },
    // Campo customer_id: stringa richiesta (ID del cliente che ha acquistato il veicolo)
    customer_id: {
        type: String, 
        required: true
    },
    // Campo sale_date: data richiesta (data della vendita)
    sale_date: {
        type: Date,
        required: true
    },
    // Campo price: numero a virgola mobile richiesto (prezzo di vendita)
    price: {
        type: Number,
        required: true
    }
});

// Creazione del modello Sale basato sullo schema definito
const Sale = mongoose.model('Sale', saleSchema);

// Esportazione del modello Sale per poter essere utilizzato in altri moduli
module.exports = Sale;
