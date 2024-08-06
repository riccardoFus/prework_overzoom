const { request } = require("express");
const User = require("../models/user")
const crypto = require('crypto');
const nodemailer = require("nodemailer")

function generateOTP() {
    return crypto.randomBytes(3).toString('hex'); // Genera un OTP a 6 cifre esadecimali
}

async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "fakeautomotive@gmail.com",
            pass: process.env.PASSWORD_EMAIL
        }
    })
    const mailOptions = {
        from: "fakeautomotive@gmail.com",
        to: email,
        subject: "OTP code for confirm registration in fake automotive",
        text: `Your OTP code is ${otp}`
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getAllAdmins = async (req, res, next) => {
    try {
        const users = await User.find({'role' : 'admin'});
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getAllCustomers = async (req, res, next) => {
    try {
        const users = await User.find({'role' : 'customer'});
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const createNewAdmin = async (req, res, next) => {
    try {
        const requester_email = req.body.requester_email;

        // Verifica se il richiedente è un amministratore
        const requester = await User.findOne({ email: requester_email, role: "admin"});
        if (!requester) {
            return res.status(403).json({ message: "Unauthorized: requester is not an admin" });
        }

        // Verifica se l'email dell'amministratore esiste già
        const existingAdmin = await User.findOne({ email: req.body.email, role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Crea un nuovo amministratore
        const newAdmin = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
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

const createNewCustomer = async (req, res, next) => {
    try {
        const existingCustomer = await User.findOne({ email: req.body.email, role: 'customer'});
        if(existingCustomer){
            return res.status(400).json({ message: "Customer already exists" });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // L'OTP scade in 10 minuti
        const newCustomer = new User({
            username: req.body.username, 
            email: req.body.email,
            password: req.body.password,
            confirmed_user: false,
            role: 'customer',
            otp: otp,
            otp_expiry: otpExpiry
        })
        // TO-DO -> OTP

        await sendOTP(req.body.email, otp)
        const savedCustomer = await newCustomer.save()
        return res.status(201).json(savedCustomer)
    }catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllUsers,
    getAllAdmins,
    getAllCustomers,
    createNewAdmin,
    createNewCustomer
}