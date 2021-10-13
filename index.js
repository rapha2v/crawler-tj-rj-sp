const express = require('express');
const app = express();

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

const cors = require('cors');
app.use(cors());

const router = require('./src/routes');
app.use(router);

const PORT = 3000;
app.listen(PORT, (err) => {
    if(err) throw new Error(`Houve um erro na inicialização: ${err.message}`);
    else console.log("Servidor iniciado com sucesso!");
});