const custom = require('../custom');
const cheerio = require('cheerio');
const moment = require('moment');

const TJSP_BASE_URL = "https://www.tjsp.jus.br/";
const NOTICE_BASE_URI = "noticias"

class TJSPController {
    static async getOnline(req, res) {
        try {
            const { status } = await custom.connAxios(TJSP_BASE_URL + NOTICE_BASE_URI);
            if (status == 200) {
                res.redirect('/tjsp/noticias');
            } else {
                res.status(status).json({
                    status: status,
                    message: "Houve algum erro na localização dos dados.",
                });
            }
        } catch (err) {
            res.status(500).json({
                status: 500,
                message: "Internal error"
            })
        }
    }
    static async getNoticias(req, res) {
        const jsonSP = await TJSPController.getJsonNewsSP();
        res.send(jsonSP);
    }
    static async getJsonNewsSP(){
        try{
            const {status, data} = await custom.connAxios(TJSP_BASE_URL+NOTICE_BASE_URI);
            if (status == 200) {
                const $ = cheerio.load(data);
                let date = [];
                let noticia = [];
                let uri = [];
                let noticias = [];

                date = $("article.noticia-item .col-sm-9 time").toArray().map(time => moment.utc(custom.replaceTagHTML($.html(time)), "DD/MM/YYYY HH:mm").toISOString());

                noticia = $("article.noticia-item .col-sm-9 h1").toArray().map(h1 => custom.replaceTagHTML($.html(h1)));

                uri = $("article.noticia-item .col-sm-9 a").toArray().map(a => a.attribs.href);

                noticias = custom.zipArrays(date, noticia, uri, TJSP_BASE_URL);

                return noticias;
            }else{
                const json = {
                    status: status,
                    message: "Houve algum erro na localização dos dados.",
                }
                return json;
            }
        }catch(err){
            const json = {
                status: 500,
                message: "Internal error"
            };
            return json;
        }
    }
    
}
module.exports = TJSPController;