const Maintenance = require("../models/maintenance")
const Vehicle = require("../models/vehicle")
const nodemailer = require("nodemailer")

const getAllMaintenances = async (req, res, next) => {
    try{
        const maintenances = await Maintenance.find({})
        return res.json(maintenances)
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

const createNewMaintenance = async (req, res, next) => {
    try {
        const existingVehicle = await Vehicle.findOne({vin: req.body.vehicle_vin})
        if(!existingVehicle || existingVehicle.status !== "under maintenance"){
            return res.status(403).json({err: "Macchina non esistente o non sotto manutenzione"})
        }else{
            // check user
            // legenda -> req.body.occurence (1 gg, 30 gg, ..., 365 gg ...)
            const dateMaintenance = Date.now()
            const newMaintenance = Maintenance({
                vehicle_vin: req.body.vehicle_vin,
                // per ora now, poi si puo far inserire (to.do)
                date: dateMaintenance,
                type: req.body.type,
                details: req.body.details || "",
                next_due_date: dateMaintenance + (req.body.occurence * 24 * 60 * 60 * 1000),
                notified: false
            })
            const savedMaintenance = await newMaintenance.save()
            return res.status(201).json(savedMaintenance)
        }
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

const notifyExpiration = async (req, res, next) => {
    try {
        // Trova tutte le manutenzioni con la prossima scadenza maggiore o uguale alla data corrente
        const maintenances = await Maintenance.find({ next_due_date: { $gte: new Date(Date.now()) } });

        // Itera su ciascuna manutenzione
        for (const maintenance of maintenances) {
            const date1 = Date.now(); // Ottieni la data corrente in millisecondi

            const date2 = new Date(maintenance.next_due_date).getTime(); // Ottieni il valore numerico della data di scadenza in millisecondi

            const diffInMillis = date2 - date1; // Calcola la differenza in millisecondi
            const diffInDays = diffInMillis / (1000 * 60 * 60 * 24); // Converti la differenza in giorni

            if (diffInDays <= 3.0 && maintenance.notified == false) {
                const vehicle = await Vehicle.findOne({ vin: maintenance.vehicle_vin });
                
                const transporter = nodemailer.createTransport({
                    service: "Gmail",
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: "fakeautomotive@gmail.com", // Indirizzo email del mittente
                        pass: process.env.PASSWORD_EMAIL // Password email presa dalle variabili d'ambiente
                    }
                });

                const mailOptions = {
                    from: "fakeautomotive@gmail.com",
                    to: vehicle.current_owner_email,
                    subject: "Reminder to do maintenance",
                    text: `Reminder to do maintenance`
                };

                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log("Email sent: ", info.response);
                    await Maintenance.findOneAndUpdate({ vehicle_vin: maintenance.vehicle_vin }, { notified: true });
                } catch (error) {
                    console.error("Error sending email: ", error);
                }
            }
        }

        return res.status(200).json({ msg: "ok" }); // Risposta con stato 200 per successo
    } catch (err) {
        console.error(err); // Log dell'errore nel server
        return res.status(500).json({ error: err.message }); // Risposta con stato 500 per errore
    }
};


module.exports = {
    getAllMaintenances,
    createNewMaintenance,
    notifyExpiration
}