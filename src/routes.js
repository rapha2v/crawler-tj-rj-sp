const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//IMPORTANDO CONTROLLERS DAS ROTAS
const TJRJController = require('./controllers/tjrjController');
const TJSPController = require('./controllers/tjspController');
const newsTjFromDateController = require('./controllers/newsTjFromDateController');

router.get('/', async (req, res) => {
        res.send("Servidor rodando!");
});

//AÇÕES DAS ROTAS DO TRIBUNAL DE JUSTIÇA RIO DE JANEIRO
router.get('/tjrj', TJRJController.getOnline);
router.get('/tjrj/noticias', TJRJController.getNoticias);

//AÇÕES DAS ROTAS DO TRIBUNAL DE JUSTIÇA SÃO PAULO
router.get('/tjsp', TJSPController.getOnline);
router.get('/tjsp/noticias', TJSPController.getNoticias);

//AÇÕES DA ROTA PELA DATA
router.post('/noticias/pordata', newsTjFromDateController.fromDate);
// ESSA ROTA ESPERA RECEBER UM JSON
// {
//     "tribunal": "tjrj" ou "tjsp",
//     "data": "yyyy-mm-dd"
// }

module.exports = router;