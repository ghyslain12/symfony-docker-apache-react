
# CRUD Docker Symfony React

Simple CRUD avec API Symfony 6.4 et front-end React 19 et MySQL et phpMyAdmin sous Docker.


## Prérequis
- Docker
- Docker Compose


## Installation

- Construction du projet :
```bash  
git clone https://github.com/ghyslain12/symfony-docker-apache-react.git
sudo chmod -R 777 symfony-docker-apache-react/
cd symfony-docker-apache-react
docker-compose up --build -d
docker exec -it symfony_app sh -c "composer install"
```  

## Utilisation docker

- Monter le conteneur :
```bash  
docker-compose up
```  
- Démonter le conteneur :
```bash  
docker-compose down
```  

## Fonctionnalités
- Back-end: Symfony Api JWT
- Front-end: React & JWT connexion / inscription
- Testing
- NelmioApiDocBundle (Swagger)
- Docker Apache Mysql

## Services
- React (front-end): http://localhost:4200
- Symfony (API): http://localhost:8741/api


## API [utilisateur, client, material, ticket, sale...]

Api NelmioApiDocBundle: http://localhost:8741/api/doc

### Créer un utilisateur
![POST](https://img.shields.io/badge/POST-%23ff9800?style=flat-square&logo=git&logoColor=white)  **`/utilisateur`** Ajoute un nouvel utilisateur dans le système.

### Lister tous les utilisateurs
![GET](https://img.shields.io/badge/GET-%2300c853?style=flat-square&logo=git&logoColor=white)  **`/utilisateur`** Récupère la liste de tous les utilisateurs.

### Récupérer un utilisateur
![GET](https://img.shields.io/badge/GET-%2300c853?style=flat-square&logo=git&logoColor=white)  **`/utilisateur/{id}`** Récupère les détails d’un utilisateur spécifique par son ID.

### Mettre à jour un utilisateur
![PUT](https://img.shields.io/badge/PUT-%23009688?style=flat-square&logo=git&logoColor=white)  **`/utilisateur/{id}`** Met à jour les informations d’un utilisateur existant.

### Supprimer un utilisateur
![DELETE](https://img.shields.io/badge/DELETE-%23f44336?style=flat-square&logo=git&logoColor=white)  **`/utilisateur/{id}`** Supprime un utilisateur spécifique par son ID.

## JWT

### Récupérer un token 
![POST](https://img.shields.io/badge/POST-%23ff9800?style=flat-square&logo=git&logoColor=white)  **`/login`** Authentifie un utilisateur et retourne un token.

- Activer (.env): JWT_ENABLE=true
- Désactiver (.env): JWT_ENABLE=false

## Aperçu

![appercu crud](ressources/preview-react.png) 

![appercu crud](ressources/login.png)

![appercu crud](ressources/swagger.png)

![appercu crud](ressources/jwt_ok.png)

![appercu crud](ressources/jwt_nok.png)