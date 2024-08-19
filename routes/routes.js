const express = require('express') // Importa il modulo express
const router  = express.Router(); // Crea un nuovo router
const userController = require('../controllers/user'); // Importa il controller per gli utenti
const vehicleController = require('../controllers/vehicle'); // Importa il controller per i veicoli
const saleController = require('../controllers/sale'); // Importa il controller per le vendite
const maintenanceController = require('../controllers/maintenance'); // Importa il controller per la manutenzione
const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ottieni il token dalla header

    if (token == null) return res.status(401).json({ message: 'Token not provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is invalid' });
        
        req.user = user; // Aggiungi le informazioni dell'utente alla request
        next(); // Passa al prossimo middleware o alla route
    });
};

// Definisce le route per ottenere gli utenti, amministratori e clienti
router.get('/api/users', authenticateToken, userController.getAllUsers);
router.get('/api/admins', authenticateToken, userController.getAllAdmins);
router.get('/api/customers', authenticateToken, userController.getAllCustomers);

// Definisce le route per creare nuovi amministratori e clienti
router.post('/api/new_admin', authenticateToken, userController.createNewAdmin);
router.post('/api/new_customer', authenticateToken, userController.createNewCustomer);

// Definisce le route per ottenere i veicoli, in vendita e in manutenzione
router.get('/api/vehicles', authenticateToken, vehicleController.getAllVehicles)
router.get('/api/on_sale_vehicles', authenticateToken, vehicleController.getAllOnSaleVehicles)
router.get('/api/under_maintenance_vehicles', authenticateToken, vehicleController.getAllUnderMaintenanceVehicles)

// Definisce la route per creare nuovi veicoli in archivio
router.post('/api/new_vehicle', authenticateToken, vehicleController.createNewVehicle)

// Definisce le route per ottenere tutte le vendite
router.get('/api/sales', authenticateToken, saleController.getAllSales)

// Definisce la route per inserire una nuova vendita
router.post('/api/new_sales', authenticateToken, saleController.createNewSales)

// Definisce le route per ottenere tutte le manutenzioni effettuate
router.get('/api/maintenances', authenticateToken, maintenanceController.getAllMaintenances)

// Definisce la route per inserire una nuova manutenzione
router.post('/api/new_maintenance', authenticateToken, maintenanceController.createNewMaintenance)

// Definisce la route per notificare le scadenze imminenti
router.get('/api/notify_expiration', authenticateToken, maintenanceController.notifyExpiration)

// Definisce le route per confermare la registrazione dell'utente + cambio password + modifica password conferma
router.post('/api/confirm_otp_registration', authenticateToken, userController.confirmOTPRegistrationCustomer)
router.get('/api/send_otp_change_password', authenticateToken, userController.sendOTPToChangePassword)
router.post('/api/change_password', authenticateToken, userController.changePassword)

// Definisce le route della parte economica
router.get('/api/report_sales', authenticateToken, saleController.getSalesReport)
router.get('/api/maintenance_sales', authenticateToken, maintenanceController.getMaintenanceReport)

// Definisce le route di auth
router.post('/api/login', userController.loginUser)
router.get('/api/logout', authenticateToken, userController.logoutUser)

module.exports = router // Esporta il router
