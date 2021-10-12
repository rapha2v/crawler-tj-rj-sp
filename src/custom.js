const axios = require('axios');

function localizarPalavra(frase, palavra) {
    var bool = false;
    for (let i = 0; i < frase.length; i++) {
        if ((i + palavra.length) <  frase.length) {
            if (frase.substring(i, palavra.length + i) === palavra) {
                bool = true;
            }
        }
    }
    return bool;
}

function replaceTagHTML(tag) {
    return tag.replace(/<.*?>/g, '').trim();
}

function zipArrays(date, news, content, uri, url) {
    let arr = [];
    for (let i = 0; i < date.length; i++) {
        arr.push({ "data": date[i], "titulo": news[i], "conteudo": content[i], "link": `${url.slice(0, -1)}${uri[i]}` });//PREENCHENDO ARRAY NOTÍCIAS COM OS DADOS DOS ARRAYS CITADOS ACIMA, ATRAVÉS DO MÉTODO PUSH()

    }
    return arr;
}

async function connAxios(url) {
    try {
        let result = await axios({
            method: 'get',
            url: url,
            responseType: 'json'
        });

        return result;
    } catch (err) {
        let jsonError = { "sucesso": false, "detalhes": `Erro ao tentar se conectar no site: ${err.message}` };
        return jsonError;
    }
}


module.exports = {
    replaceTagHTML,
    zipArrays,
    connAxios,
    localizarPalavra,
};