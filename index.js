const express = require('express');
const app = express();
const cron = require('node-cron');

//IMPORTANDO CONTROLLERS DAS ROTAS
const TJRJController = require('./src/controllers/tjrjController');
const TJSPController = require('./src/controllers/tjspController');

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

const cors = require('cors');
app.use(cors());

const router = require('./src/routes');
app.use(router);

const mongoose = require('mongoose');

mongoose.connect("mongodb://mongo/noticiasTJ",{ //url específica do monogoDB, porta padrão do mongo 27017 e depois indicar o banco que vc quer usar
useNewUrlParser: true, //serve para indicar ao mongoose para usar o novo sistema de URL do mongo
useUnifiedTopology: true //é um mecanismo de monitoramento de banco de dados
})
    .then(db => {
        console.log("Conexão com Mongo estabelecida");
    })
    .catch(err => {
        console.log(err.message);
    });

cron.schedule('*/30 * * * *', async () => {
    await TJRJController.getNoticias();
    await TJSPController.getNoticias();
});

const PORT = 3000;
app.listen(PORT, (err) => {
    if(err) throw new Error(`Houve um erro na inicialização: ${err.message}`);
    else console.log("Servidor iniciado com sucesso!");
});