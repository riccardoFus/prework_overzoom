const express = require('express');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log("Server is running on port", server.address().port)
});
