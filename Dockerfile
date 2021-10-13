#nome da imagem que vamos utilizar
FROM node:alpine 
#diretório que vamos trabalhar
WORKDIR /usr/app
#Copia o arquivo para dentro da imagem
COPY package*.json ./
#comando que vai ser executado antes de subir a API, por exemplo aqui é par ainstalar as dependências
RUN npm install
#. . copia todos arquivos da pasta raiz para dentro da imagem
COPY . .
#a porta que a aplicação vai rodar
EXPOSE 3000
#o comando que vai ser utilizado para iniciar a aplicação
CMD npm start