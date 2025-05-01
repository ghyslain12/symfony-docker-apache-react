<?php

/*use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}
*/

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

// Charger .env.test pour les tests
(new Dotenv())->bootEnv(dirname(__DIR__) . '/.env.test', 'test');

if ($_SERVER['APP_DEBUG']) {
    umask(0000);
}


