const custom = require('../custom');
const cheerio = require('cheerio');
const moment = require('moment');
const { text } = require('cheerio/lib/api/manipulation');

const TJRJ_BASE_URL = "http://www.tjrj.jus.br/";
const NOTICE_BASE_URI = "web/guest/noticias?p_p_id=com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_lFJyjb7iMZVO&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_lFJyjb7iMZVO_delta=20&p_r_p_resetCur=false&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_lFJyjb7iMZVO_cur=1";

class TJRJController {
    static async getOnline(req, res) {
        try {
            const { status } = await custom.connAxios(TJRJ_BASE_URL + NOTICE_BASE_URI);
            if (status == 200) {
                res.redirect('/tjrj/noticias');
            } else {
                res.status(status).json({
                    status: status,
                    message: "Erro na recuperação dos dados.",
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
        const jsonRJ = await TJRJController.getNewsJsonRJ();
        res.send(jsonRJ);
    }
    static async getNewsJsonRJ() {
        try {
            const { status, data } = await custom.connAxios(TJRJ_BASE_URL + NOTICE_BASE_URI);
            if (status == 200) {
                const $ = cheerio.load(data);
                let date = [];
                let noticia = [];
                let uri = [];
                let conteudo = [];
                let noticias = [];

                //PEGNDO AS DATAS E TRANSFORMANDO-AS EM ARRAY
                date = $("ul.lista-noticias span strong").toArray().map(strong => {
                    let ymd = custom.replaceTagHTML($.html(strong)).split("-")[0].trim();
                    let hm = custom.replaceTagHTML($.html(strong).split("-")[1].trim().replace(/h &gt;/g, ""));

                    return moment.utc(ymd + " " + hm, "DD/MM/YYYY HH:mm").toISOString();
                });
                //PEGNDO OS TÍTULOS DAS NOTICIAS E TRANSFORMANDO-AS EM ARRAY
                noticia = $("ul.lista-noticias span a").toArray().map(a => a.attribs.title.trim());
                //PEGANDO AS URI E TRANSFORMANDO-AS EM ARRAY
                uri = $("ul.lista-noticias span a").toArray().map(href => href.attribs.href.trim());
                //PEGANDO O CONTEÚDO DAS NOTÍCIAS
                conteudo = await Promise.all($("ul.lista-noticias span a").toArray().map(async href => {
                    let url = TJRJ_BASE_URL + href.attribs.href.trim().substring(1);
                    return await TJRJController.getContentNewsRJ(url);
                }));
                //PEGANDO AS DATAS, TÍTULOS E URIs CORRELANCIONANDO
                noticias = custom.zipArrays(date, noticia, conteudo, uri, TJRJ_BASE_URL);

                const json = {
                    "success": true,
                    "fonte": "tjrj",
                    "noticias": noticias
                };
                return json;
            } else {
                const json = {
                    status: status,
                    message: "Erro na recuperação dos dados.",
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
    static async getContentNewsRJ(url) {
        try {
            const { data, status } = await custom.connAxios(url);
            if (status == 200) {
                const $ = cheerio.load(data);
                const texto = [];
                $("div.conteudo p").toArray().map(p => {
                    const pFormated = custom.replaceTagHTML($.html(p).replace(/&nbsp;/g, " "));
                    if (pFormated != "" && pFormated != "&nbsp;") {
                        texto.push(pFormated);
                    }
                });
                const imagens = [];
                $("div.conteudo img").toArray().map(img => {
                    if(!custom.localizarPalavra(img.attribs.src.trim(), TJRJ_BASE_URL) && 
                    custom.localizarPalavra(img.attribs.src.trim(), "/documents/")){
                        imagens.push(TJRJ_BASE_URL+img.attribs.src.trim().substring(1));
                        return;
                    }
                    imagens.push(img.attribs.src.trim());
                });
                const conteudo = {
                    "imagens": Object.assign({}, imagens),
                    "texto": texto
                };
                return conteudo;
            } else {
                return "Erro na recuperação dos dados.";
            }
        } catch (err) {
            return "Erro na recuperação dos dados.";
        }
    }
}

module.exports = TJRJController;