const mongoose = require('mongoose'); // Importa il modulo mongoose

// Definizione dello schema per la collezione "Maintenances"
const maintenanceSchema = new mongoose.Schema({
    // Campo vehicle_vin: stringa richiesta (ID del veicolo)
    vehicle_vin: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo date: data richiesta (data dell'intervento di manutenzione)
    date: {
        type: Date,
        required: true // Questo campo è obbligatorio
    },
    // Campo type: stringa richiesta (tipo di manutenzione)
    type: {
        type: String,
        required: true // Questo campo è obbligatorio
    },
    // Campo details: stringa opzionale (dettagli dell'intervento)
    details: {
        type: String // Questo campo è facoltativo
    },
    // Campo next_due_date: data richiesta (data della prossima manutenzione programmata)
    next_due_date: {
        type: Date,
        required: true // Questo campo è obbligatorio
    },
    // Campo notified: booleano (indica se la manutenzione è stata notificata)
    notified: {
        type: Boolean,
        default: false // Il valore predefinito è false
    }
});

// Creazione del modello Maintenance basato sullo schema definito
const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

// Esportazione del modello Maintenance per poter essere utilizzato in altri moduli
module.exports = Maintenance;
