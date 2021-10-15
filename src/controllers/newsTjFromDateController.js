const moment = require('moment');
const mongoose = require('mongoose');
const newsModel = require('../Model/News');
const newsRj = mongoose.model("NoticiasRJ", newsModel, "NoticiasRJ");
const newsSp = mongoose.model("NoticiasSP", newsModel, "NoticiasSP");

//IMPORTANDO CONTROLLERS DAS ROTAS
const TJRJController = require('./tjrjController');
const TJSPController = require('./tjspController');

class newsTjFromDate {
    static async fromDate(req, res) {
        let jsonAllFromDate = req.body;
        const { tribunal, data } = jsonAllFromDate;
        const date = data;
        if (tribunal == "tjrj") {
            try {
                newsRj.find({}, (err, data) => {
                    if (err) {
                        console.log(err.message);
                    }
                    if (data.length) {
                        const jsonRj = data[0];
                        let { noticias } = jsonRj;
                        let newsFilterDate = [];
                        for (let noticia of noticias) {
                            let onlyDate = moment(noticia.data).utc().format('YYYY-MM-DD');
                            if (moment(onlyDate).isSame(date)) {
                                newsFilterDate.push(noticia);
                            }
                        }
                        res.send(newsFilterDate);
                    }
                });
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
                newsSp.find({}, (err, data) => {
                    if (err) {
                        console.log(err.message);
                    }
                    if (data.length) {
                        const jsonSp = data[0];
                        let { noticias } = jsonSp;
                        let newsFilterDate = [];
                        for (let noticia of noticias) {
                            let onlyDate = moment(noticia.data).utc().format('YYYY-MM-DD');
                            if (moment(onlyDate).isSame(date)) {
                                newsFilterDate.push(noticia);
                            }
                        }
                        res.send(newsFilterDate);
                    }
                });
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