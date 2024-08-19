const { request } = require("express"); // Importa il modulo request da express
const User = require("../models/user"); // Importa il modello User
const crypto = require('crypto'); // Importa il modulo crypto per generare l'OTP
const nodemailer = require("nodemailer"); // Importa il modulo nodemailer per inviare email
const bcrypt = require('bcrypt'); // Importa bcrypt per la gestione delle password
const jwt = require('jsonwebtoken'); // Importa jwt per la generazione dei token

// Funzione per generare un OTP a 6 cifre esadecimali
function generateOTP() {
    return crypto.randomBytes(3).toString('hex');
}

// Funzione per hashare una password
async function hashPassword(password) {
    const saltRounds = 10; // Maggiore è il numero di sali, più sicuro sarà l'hash, ma anche più lento da generare
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (err) {
        console.error("Error hashing password: ", err);
        throw err;
    }
}

// Funzione per inviare l'OTP tramite email
async function sendOTP(email, otp) {
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
        to: email,
        subject: "OTP code for confirm registration in fake automotive",
        text: `Your OTP code is ${otp}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}

// Funzione per ottenere tutti gli utenti
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per ottenere tutti gli amministratori
const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await User.find({ role: 'admin' });
        return res.json(admins);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per ottenere tutti i clienti
const getAllCustomers = async (req, res, next) => {
    try {
        const customers = await User.find({ role: 'customer' });
        return res.json(customers);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per creare un nuovo amministratore
const createNewAdmin = async (req, res, next) => {
    try {
        const requester_email = req.body.requester_email;

        // Verifica se il richiedente è un amministratore
        const requester = await User.findOne({ email: requester_email, role: "admin" });
        if (!requester) {
            return res.status(403).json({ message: "Unauthorized: requester is not an admin" });
        }

        // Verifica se l'email dell'amministratore esiste già
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash della password
        const hashedPassword = await hashPassword(req.body.password);

        // Crea un nuovo amministratore
        const newAdmin = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            confirmed_user: true,
            role: 'admin',
            otp: '',
            otp_expiry: Date()
        });

        // Salva il nuovo amministratore
        const savedAdmin = await newAdmin.save();
        return res.status(201).json(savedAdmin);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per creare un nuovo cliente
const createNewCustomer = async (req, res, next) => {
    try {
        // Verifica se l'email del cliente esiste già
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Genera l'OTP e la data di scadenza
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // L'OTP scade in 10 minuti

        // Hash della password
        const hashedPassword = await hashPassword(req.body.password);

        // Crea un nuovo cliente
        const newCustomer = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            confirmed_user: false,
            role: 'customer',
            otp: otp,
            otp_expiry: otpExpiry
        });

        // Invia l'OTP al cliente
        await sendOTP(req.body.email, otp);
        const savedCustomer = await newCustomer.save();
        return res.status(201).json(savedCustomer);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per confermare la registrazione del cliente tramite OTP
const confirmOTPRegistrationCustomer = async (req, res, next) => {
    try {
        // Cerca un utente con l'email specificata e il ruolo di "customer"
        const existingCustomer = await User.findOne({ email: req.body.email, role: 'customer' });

        // Verifica se il cliente esiste
        if (!existingCustomer) {
            return res.status(400).json({ message: "Customer does not exist" });
        }

        const otp = req.body.otp;

        // Verifica se l'OTP è valido e non è scaduto
        if (otp && otp === existingCustomer.otp && new Date(existingCustomer.otp_expiry).getTime() >= Date.now()) {
            await User.findOneAndUpdate({ email: req.body.email, role: 'customer' }, { confirmed_user: true });
            return res.status(200).json({ message: "OK" });
        } else {
            return res.status(400).json({ message: "OTP incorrect or OTP expired" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per inviare un OTP per il cambio password
const sendOTPToChangePassword = async (req, res, next) => {
    try {
        // Cerca un utente con l'email specificata
        const existingUser = await User.findOne({ email: req.body.email });

        // Verifica se l'utente esiste
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Genera l'OTP e la data di scadenza
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // L'OTP scade in 10 minuti

        // Invia l'OTP all'utente
        await sendOTP(req.body.email, otp);
        await User.findOneAndUpdate({ email: req.body.email }, { otp: otp, otp_expiry: otpExpiry });
        return res.status(200).json({ message: "OK" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per cambiare la password
const changePassword = async (req, res, next) => {
    try {
        // Cerca un utente con l'email specificata
        const existingUser = await User.findOne({ email: req.body.email });

        // Verifica se l'utente esiste
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const otp = req.body.otp;
        const hashedPassword = await hashPassword(req.body.password);

        // Verifica se l'OTP è corretto e non è scaduto
        if (otp && otp === existingUser.otp && new Date(existingUser.otp_expiry).getTime() >= Date.now()) {
            // Aggiorna la password
            await User.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword });
            return res.status(200).json({ message: "Password changed successfully" });
        } else {
            return res.status(400).json({ message: "OTP incorrect or OTP expired" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per il login dell'utente
const loginUser = async (req, res, next) => {
    try {
        // Cerca l'utente in base all'email fornita
        const user = await User.findOne({ email: req.body.email });

        // Verifica se l'utente esiste
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Controlla se l'utente ha confermato l'account
        if (!user.confirmed_user) {
            return res.status(400).json({ message: "User account not confirmed" });
        }

        // Verifica la password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Crea il payload del token JWT
        const payload = {
            userId: user._id,
            role: user.role
        };

        // Genera il token JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Restituisce il token e i dettagli dell'utente
        return res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Funzione per il logout dell'utente
const logoutUser = (req, res) => {
    return res.status(200).json({ message: "OK" });
};

// Esporta le funzioni come modulo
module.exports = {
    getAllUsers,
    getAllAdmins,
    getAllCustomers,
    createNewAdmin,
    createNewCustomer,
    confirmOTPRegistrationCustomer,
    sendOTPToChangePassword,
    changePassword,
    loginUser,
    logoutUser
};
