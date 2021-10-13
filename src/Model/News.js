const mongoose = require('mongoose');

const newsModel = new mongoose.Schema({
    success: Boolean,
    fonte: String,
    noticia: Array
});

module.exports = newsModel;