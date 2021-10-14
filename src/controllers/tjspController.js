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
    static async getJsonNewsSP() {
        try {
            const { status, data } = await custom.connAxios(TJSP_BASE_URL + NOTICE_BASE_URI);
            if (status == 200) {
                const $ = cheerio.load(data);
                let date = [];
                let titulo = [];
                let conteudo = [];
                let uri = [];
                let noticias = [];

                date = $("article.noticia-item .col-sm-9 time").toArray().map(time => moment.utc(custom.replaceTagHTML($.html(time)), "DD/MM/YYYY HH:mm").toISOString());

                titulo = $("article.noticia-item .col-sm-9 h1").toArray().map(h1 => custom.replaceTagHTML($.html(h1)));

                uri = $("article.noticia-item .col-sm-9 a").toArray().map(a => a.attribs.href);

                conteudo = await Promise.all($("article.noticia-item .col-sm-9 a").toArray().map(async href => {
                    let url = TJSP_BASE_URL + href.attribs.href.trim().substring(1);
                    return await TJSPController.getContentNewsSP(url);
                }));

                noticias = custom.zipArrays(date, titulo, conteudo, uri, TJSP_BASE_URL);

                const json = {
                    "success": true,
                    "fonte": "tjsp",
                    "noticias": noticias
                };
                
                return json;
            } else {
                const json = {
                    status: status,
                    message: "Houve algum erro na localização dos dados.",
                }
                return json;
            }
        } catch (err) {
            const json = {
                status: 500,
                message: "Internal error"
            };
            return json;
        }
    }

    static async getContentNewsSP(url) {
        try {
            //DESTRUCTURING DO OBJECT RECEBIDO PELO AXIOS
            const { data, status } = await custom.connAxios("https://www.tjsp.jus.br/Noticias/Noticia?codigoNoticia=75556&pagina=1");
            //CHECANDO SE O STATUS É 200
            if (status == 200) {
                //CARREGANDO O CONTEÚDO RECEBIDO NO CHEERIO
                const $ = cheerio.load(data);
                //INSTANCIANDO OS ARRAYS QUE VAMOS UTILIZAR
                let texto = [];
                let imagens = [];
                //PEGANDO O TEXTO DA URL PASSADA, NO CASO, SE UMA NOTÍCIA
                $("div.noticia-content div").toArray().map(div => {
                    const divFormated = custom.replaceTagHTML($.html(div).replace(/&nbsp;/g, " ").replace(/<a .*href="([^"]*)".*?<\/a>/gim, "$1").trim());
                    if (divFormated != "") {
                        texto.push(divFormated);
                    }
                });
                //PEGANDO A IMAGEM DE UMA NOTÍCIA
                $("div.noticia-img img").toArray().map(img => {
                    imagens.push(img.attribs.src.trim());
                });
                const conteudo = {
                    "imagens": imagens,
                    "texto": texto
                };
                return conteudo;
            } else {
            }
        } catch (err) {
            return "Erro na recuperação dos dados.";
        }
    }

}
module.exports = TJSPController;