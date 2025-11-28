FROM node:18-alpine

#Carpeta de trabajo
WORKDIR /app
#Copia de los archivos de dependencias
COPY package*.json ./
#Instalación de dependencias y copiado de archivos del backend
RUN npm install --production
COPY . .
#Exponemos el puerto 3000
EXPOSE 3000
#Iniciamos el servidor
CMD ["node", "server.js"]
