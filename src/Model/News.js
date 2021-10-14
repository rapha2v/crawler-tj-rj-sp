const mongoose = require('mongoose');

const newsModel = new mongoose.Schema({
    success: Boolean,
    fonte: String,
    noticias: [
        {
            titulo: String,
            data: Date,
            link: String,
            conteudo: {
                imagens: Array,
                texto: Array
            }
        }
    ]
});

module.exports = newsModel;