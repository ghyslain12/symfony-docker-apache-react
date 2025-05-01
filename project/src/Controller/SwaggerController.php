<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Yaml\Yaml;

class SwaggerController extends AbstractController
{
    #[Route('/api/doc', name: 'swagger_ui', methods: ['GET'])]
    public function index(): Response
    {
        $swaggerFile = $this->getParameter('kernel.project_dir') . '/config/swagger.yaml';
        $swaggerContent = Yaml::parseFile($swaggerFile);

        return $this->render('@NelmioApiDoc/SwaggerUi/index.html.twig', [
            'swagger_data' => [
                'spec' => $swaggerContent,
                'url' => '/api/doc.json',
            ],
            'assets_mode' => 'web',
            'swagger_ui_config' => [
                'dom_id' => '#swagger-ui',
                'layout' => 'BaseLayout',
            ],
        ]);
    }
}