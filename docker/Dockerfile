FROM php:8.1-apache

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
  locales apt-utils git libicu-dev g++ libpng-dev libxml2-dev libzip-dev libonig-dev libxslt-dev unzip \
  && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen  \
  && echo "fr_FR.UTF-8 UTF-8" >> /etc/locale.gen \
  && locale-gen \
  && curl -sS https://getcomposer.org/installer | php -- \
  && mv composer.phar /usr/local/bin/composer \
  && curl -sL https://deb.nodesource.com/setup_18.x | bash \
  && apt-get install nodejs -y \
  && docker-php-ext-configure intl \
  && docker-php-ext-install pdo pdo_mysql opcache intl zip calendar dom mbstring gd xsl \
  && pecl install apcu && docker-php-ext-enable apcu \
  && curl -1sLf 'https://dl.cloudsmith.io/public/symfony/stable/setup.deb.sh' | bash \
  && apt-get update \
  && apt-get install -y symfony-cli

# Nettoyage
RUN apt-get -y autoremove \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Définir le répertoire de travail
WORKDIR /var/www/

# Copier les fichiers Composer du projet existant
COPY ./project/composer.json ./project/composer.lock* /var/www/

# Exécuter composer install pour installer les dépendances dans /var/www/vendor
RUN composer install --no-scripts --no-interaction \
  && composer require symfony/amphp-http-client-meta --no-scripts --no-interaction