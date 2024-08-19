const mongoose = require('mongoose'); // Importa il modulo mongoose

// Definizione dello schema per la collezione "Sales"
const saleSchema = new mongoose.Schema({
    // Campo vehicle_vin: stringa richiesta (ID del veicolo venduto)
    vehicle_vin: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo customer_email: stringa richiesta (email del cliente che ha acquistato il veicolo)
    customer_email: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo sale_date: data richiesta (data della vendita)
    sale_date: {
        type: Date,
        required: true // Questo campo è obbligatorio
    },
    // Campo price: numero a virgola mobile richiesto (prezzo di vendita)
    price: {
        type: Number,
        required: true // Questo campo è obbligatorio
    }
});

// Creazione del modello Sale basato sullo schema definito
const Sale = mongoose.model('Sale', saleSchema);

// Esportazione del modello Sale per poter essere utilizzato in altri moduli
module.exports = Sale;
