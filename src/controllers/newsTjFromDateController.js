const moment = require('moment');

//IMPORTANDO CONTROLLERS DAS ROTAS
const TJRJController = require('./tjrjController');
const TJSPController = require('./tjspController');

class newsTjFromDate {
    static async fromDate(req, res) {
        let jsonAllFromDate = req.body;
        const { tribunal, data } = jsonAllFromDate;
        if (tribunal == "tjrj") {
            try {
                const jsonRJ = await TJRJController.getNewsJsonRJ();
                let { noticias } = jsonRJ;
                let newsFilterDate = [];
                for (let noticia of noticias) {
                    let onlyDate = noticia.data.split('T')[0];
                    if (moment(onlyDate).isSame(data)) {
                        noticia.fonte = tribunal;
                        newsFilterDate.push(noticia);
                    }
                }
                res.send(newsFilterDate);
            } catch (err) {
                console.log(err.message);
                res.status(500).json({
                    status: 500,
                    message: `Internal error: ${err.message}.`
                });
            }
        }

        if (tribunal == "tjsp") {
            try {
                const jsonSP = await TJSPController.getJsonNewsSP();
                let { noticias } = jsonSP;
                let newsFilterDate = [];
                for (let noticia of noticias) {
                    let onlyDate = noticia.data.split('T')[0];
                    if (moment(onlyDate).isSame(data)) {
                        noticia.fonte = tribunal;
                        newsFilterDate.push(noticia);
                    }
                }
                res.send(newsFilterDate);
            } catch (err) {
                console.log(err.message);
                res.status(500).json({
                    status: 500,
                    message: `Internal error: ${err.message}.`
                });
            }
        }
    }
}

module.exports = newsTjFromDate;