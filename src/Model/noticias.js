const mongoose = require('mongoose');

const newsModel = new mongoose.Schema({
    success: Boolean,
    fonte: String,
    noticia: {
        titulo: String,
        data: Date,
        link: String,
        conteudo: {
            imagens: Array,
            conteudo: Array
        }
    }
});

module.exports = newsModel;