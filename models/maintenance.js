const mongoose = require("mongoose");

// Definizione dello schema per la collezione Maintenances
const maintenanceSchema = new mongoose.Schema({
    // Campo vehicle_id: stringa richiesta (ID del veicolo)
    vehicle_id: {
        type: String,
        required: true
    },
    // Campo date: data richiesta (data dell'intervento di manutenzione)
    date: {
        type: Date,
        required: true
    },
    // Campo type: stringa richiesta (tipo di manutenzione)
    type: {
        type: String,
        required: true
    },
    // Campo details: stringa opzionale (dettagli dell'intervento)
    details: {
        type: String
    },
    // Campo next_due_date: data richiesta (data della prossima manutenzione programmata)
    next_due_date: {
        type: Date,
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    }
});

// Creazione del modello Maintenance basato sullo schema definito
const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

// Esportazione del modello Maintenance per poter essere utilizzato in altri moduli
module.exports = Maintenance;
