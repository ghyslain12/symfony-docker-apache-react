# Image de base Node
FROM node:20-alpine

RUN apk add --no-cache bash \
 && apk add --no-cache vim
 
# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./
		
# Installer les dépendances
RUN npm install

# Copier tout le code source existant
COPY . .

RUN npm install 

EXPOSE 4200

CMD ["npm", "run", "dev"]

