const custom = require('../custom');
const cheerio = require('cheerio');
const moment = require('moment');
const mongoose = require('mongoose');
const newsModel = require('../Model/News');
const news = mongoose.model("NoticiasRJ", newsModel, "NoticiasRJ");


const TJRJ_BASE_URL = "http://www.tjrj.jus.br/";
const NOTICE_BASE_URI = "web/guest/noticias?p_p_id=com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_lFJyjb7iMZVO&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_lFJyjb7iMZVO_delta=20&p_r_p_resetCur=false&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_lFJyjb7iMZVO_cur=3";

class TJRJController {
    static async getNoticias() {
        const jsonRJ = await TJRJController.getNewsJsonRJ();
        const n = new news(jsonRJ);
        try {
            news.find({ 'fonte': "tjrj" }, (err, data) => {
                if (err) {
                    console.log(err.message);
                    return;
                }
                if (data.length) {
                    const tituloArr = [];
                    for (let noticia of data[0].noticias) {
                        tituloArr.push(noticia.titulo);
                    }
                    for (let noticia of jsonRJ.noticias) {
                        if (!tituloArr.includes(noticia.titulo)) {
                            data[0].noticias.push(noticia);
                        }
                    }
                    data[0].save();
                } else {
                    n.save();
                }
            });
            console.log("Dados RJ atualizados com sucesso!");
        } catch (err) {
            console.log(`Erro na atualização de dados RJ: ${err.message}`)
        }
    }
    static async getNewsJsonRJ() {
        try {
            //DESTRUCTURING DO OBJECT RECEBIDO PELO AXIOS
            const { status, data } = await custom.connAxios(TJRJ_BASE_URL + NOTICE_BASE_URI);
            //CHECANDO SE O STATUS É 200
            if (status == 200) {
                //CARREGANDO O CONTEÚDO RECEBIDO NO CHEERIO
                const $ = cheerio.load(data);
                //INSTANCIANDO OS ARRAYS QUE VAMOS UTILIZAR
                let date = [];
                let titulo = [];
                let conteudo = [];
                let uri = [];
                let noticias = [];

                //PEGNDO AS DATAS E TRANSFORMANDO-AS EM ARRAY
                date = $("ul.lista-noticias span strong").toArray().map(strong => {
                    let ymd = custom.replaceTagHTML($.html(strong)).split("-")[0].trim();
                    let hm = custom.replaceTagHTML($.html(strong).split("-")[1].trim().replace(/h &gt;/g, ""));

                    return moment.utc(ymd + " " + hm, "DD/MM/YYYY HH:mm").toISOString();
                });
                //PEGNDO OS TÍTULOS DAS NOTICIAS E TRANSFORMANDO-AS EM ARRAY
                titulo = $("ul.lista-noticias span a").toArray().map(a => a.attribs.title.trim());
                //PEGANDO AS URI E TRANSFORMANDO-AS EM ARRAY
                uri = $("ul.lista-noticias span a").toArray().map(href => href.attribs.href.trim());
                //PEGANDO O CONTEÚDO DAS NOTÍCIAS A PARTIR DE OUTRA CONEXÃO FEITA PELO MÉTODO getContentNewsRJ()
                conteudo = await Promise.all($("ul.lista-noticias span a").toArray().map(async href => {
                    let url = TJRJ_BASE_URL + href.attribs.href.trim().substring(1);
                    return await TJRJController.getContentNewsRJ(url);
                }));
                //PEGANDO AS DATAS, TÍTULOS E URIs CORRELANCIONANDO
                noticias = custom.zipArrays(date, titulo, conteudo, uri, TJRJ_BASE_URL);

                const json = {
                    "success": true,
                    "fonte": "tjrj",
                    "noticias": noticias
                };
                return json;
            } else {//ERRO CASO O STATUS NÃO SEJA 200
                const json = {
                    status: status,
                    message: "Erro na recuperação dos dados.",
                }
                return json;
            }
        } catch (err) {
            const json = {
                status: 500,
                message: `Internal error: ${err.message}.`
            };
            return json;
        }
    }
    static async getContentNewsRJ(url) {
        try {
            //DESTRUCTURING DO OBJECT RECEBIDO PELO AXIOS
            const { data, status } = await custom.connAxios(url);
            //CHECANDO SE O STATUS É 200
            if (status == 200) {
                //CARREGANDO O CONTEÚDO RECEBIDO NO CHEERIO
                const $ = cheerio.load(data);
                //INSTANCIANDO OS ARRAYS QUE VAMOS UTILIZAR
                let texto = [];
                let imagens = [];
                //PEGANDO O TEXTO DA URL PASSADA, NO CASO, SE UMA NOTÍCIA
                $("div.conteudo p").toArray().map(p => {
                    const pFormated = custom.replaceTagHTML($.html(p).replace(/&nbsp;/g, " ").replace(/<a .*href="([^"]*)".*?<\/a>/gim, "$1").trim());
                    if (pFormated != "" && pFormated != "&nbsp;") {
                        texto.push(pFormated);
                    }
                });
                //PEGANDO A IMAGEM DE UMA NOTÍCIA
                $("div.conteudo img").toArray().map(img => {
                    if (!custom.localizarPalavra(img.attribs.src.trim(), TJRJ_BASE_URL) &&
                        custom.localizarPalavra(img.attribs.src.trim(), "/documents/")) {
                        imagens.push(TJRJ_BASE_URL + img.attribs.src.trim().substring(1));
                        return;
                    }
                    imagens.push(img.attribs.src.trim());
                });
                const conteudo = {
                    "imagens": imagens,
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