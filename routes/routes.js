const express = require('express'); // Importa il modulo express
const router = express.Router(); // Crea un nuovo router
const userController = require('../controllers/user'); // Importa il controller per gli utenti
const vehicleController = require('../controllers/vehicle'); // Importa il controller per i veicoli
const saleController = require('../controllers/sale'); // Importa il controller per le vendite
const maintenanceController = require('../controllers/maintenance'); // Importa il controller per la manutenzione
const jwt = require('jsonwebtoken'); // Importa il modulo jsonwebtoken

// Middleware per autenticare il token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Ottieni l'header di autorizzazione
    const token = authHeader && authHeader.split(' ')[1]; // Estrai il token dall'header

    if (token == null) return res.status(401).json({ message: 'Token not provided' }); // Se il token non è fornito, restituisci 401

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is invalid' }); // Se il token non è valido, restituisci 403

        req.user = user; // Aggiungi le informazioni dell'utente alla richiesta
        next(); // Passa al prossimo middleware o alla route
    });
};

// Route per ottenere gli utenti, amministratori e clienti
router.get('/api/users', authenticateToken, userController.getAllUsers);
router.get('/api/admins', authenticateToken, userController.getAllAdmins);
router.get('/api/customers', authenticateToken, userController.getAllCustomers);

// Route per creare nuovi amministratori e clienti
router.post('/api/new_admin', authenticateToken, userController.createNewAdmin);
router.post('/api/new_customer', authenticateToken, userController.createNewCustomer);

// Route per ottenere veicoli, in vendita e in manutenzione
router.get('/api/vehicles', authenticateToken, vehicleController.getAllVehicles);
router.get('/api/on_sale_vehicles', authenticateToken, vehicleController.getAllOnSaleVehicles);
router.get('/api/under_maintenance_vehicles', authenticateToken, vehicleController.getAllUnderMaintenanceVehicles);

// Route per creare nuovi veicoli
router.post('/api/new_vehicle', authenticateToken, vehicleController.createNewVehicle);

// Route per ottenere e creare vendite
router.get('/api/sales', authenticateToken, saleController.getAllSales);
router.post('/api/new_sales', authenticateToken, saleController.createNewSales);

// Route per ottenere e creare manutenzioni
router.get('/api/maintenances', authenticateToken, maintenanceController.getAllMaintenances);
router.post('/api/new_maintenance', authenticateToken, maintenanceController.createNewMaintenance);

// Route per notificare scadenze imminenti
router.get('/api/notify_expiration', authenticateToken, maintenanceController.notifyExpiration);

// Route per confermare la registrazione, inviare OTP per cambio password e cambiare la password
router.post('/api/confirm_otp_registration', authenticateToken, userController.confirmOTPRegistrationCustomer);
router.get('/api/send_otp_change_password', authenticateToken, userController.sendOTPToChangePassword);
router.post('/api/change_password', authenticateToken, userController.changePassword);

// Route per report economici
router.get('/api/report_sales', authenticateToken, saleController.getSalesReport);
router.get('/api/maintenance_sales', authenticateToken, maintenanceController.getMaintenanceReport);

// Route di autenticazione
router.post('/api/login', userController.loginUser);
router.get('/api/logout', authenticateToken, userController.logoutUser);

module.exports = router; // Esporta il router
