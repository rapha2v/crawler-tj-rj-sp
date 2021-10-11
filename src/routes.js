const express = require('express');
const router = express.Router();
const axios = require('axios');

//IMPORTANDO CONTROLLERS DAS ROTAS
const TJRJController = require('./controllers/tjrjController');
const TJSPController = require('./controllers/tjspController');

router.get('/', (req, res) => {
    res.send("servidor rodando.");
});

//AÇÕES DAS ROTAS DO TRIBUNAL DE JUSTIÇA RIO DE JANEIRO
router.get('/tjrj', TJRJController.getOnline);
router.get('/tjrj/noticias', TJRJController.getNoticias);

//AÇÕES DAS ROTAS DO TRIBUNAL DE JUSTIÇA SÃO PAULO
router.get('/tjsp', TJSPController.getOnline);
router.get('/tjsp/noticias', TJSPController.getNoticias);

//AÇÕES DA ROTA PELA DATA
// router.post('/api/todas', (req, res) => {
//     let jsonAllFromDate = req.query;
//     console.log(jsonAllFromDate);
//     const { tribunal, data } = jsonAllFromDate;
//     if (tribunal == "tjrj") {
//         TJRJController.getJsonNewsRJ()
//             .then(jsonRJ => {
//                 let { noticias } = jsonRJ;
//                 let newsFilterDate = [];
//                 for (let noticia of noticias) {
//                     let onlyDate = noticia.data.split('T')[0];
//                     if(moment(onlyDate).isSame(data)){
//                         noticia.fonte = tribunal;
//                         newsFilterDate.push(noticia);
//                     }
//                 }
//                 res.send(newsFilterDate);
//             })
//             .catch(err=>{
//                 res.send({});
//             });
//     }

//     if(tribunal == "tjsp"){
//         TJSPController.getJsonNewsSP()
//             .then(jsonSP => {
//                 console.log(jsonSP); 
//                 let { noticias } = jsonSP;
//                 let newsFilterDate = [];
//                 for(let noticia of noticias){
//                     let onlyDate = noticia.data.split('T')[0];
//                     if(moment(onlyDate).isSame(data)){
//                         noticia.fonte = tribunal;
//                         newsFilterDate.push(noticia);
//                     }
//                 }
//                 res.send(newsFilterDate);
//             })
//             .catch(err => {
//                 res.send({});
//             })
//     }
// });



module.exports = router;