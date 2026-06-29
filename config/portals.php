<?php

return [
    /*
    | Groupes d'accès — chaque membre choisit son portail à la connexion.
    */
    'groups' => [
        'citizen' => [
            'label'       => 'Citoyen / Concepteur',
            'description' => 'Concevoir, soumettre et suivre vos projets',
            'redirect'    => '/projects',
            'roles'       => ['buyer'],
        ],
        'expert' => [
            'label'       => 'Groupe d\'experts',
            'description' => 'Validation, corrections et approbation des projets',
            'redirect'    => '/government/expert/projects',
            'roles'       => ['government'],
            'department'  => ['expert'],
        ],
        'tutelage' => [
            'label'       => 'Service de tutelle',
            'description' => 'Budget, proformas, décaissement et lancement',
            'redirect'    => '/government/tutelage/projects',
            'roles'       => ['government'],
            'department'  => ['tutelle', 'budget'],
        ],
        'commune' => [
            'label'       => 'Administration communale',
            'description' => 'Suivi des projets à l\'échelle de la commune',
            'redirect'    => '/government/dashboard',
            'roles'       => ['government'],
            'officer_level' => ['commune'],
        ],
        'territory' => [
            'label'       => 'Administration urbaine / territoriale',
            'description' => 'Coordination ville et territoire',
            'redirect'    => '/government/dashboard',
            'roles'       => ['government'],
            'officer_level' => ['territory'],
        ],
        'provincial' => [
            'label'       => 'Administration provinciale',
            'description' => 'Vue provinciale des projets citoyens',
            'redirect'    => '/government/dashboard',
            'roles'       => ['government'],
            'officer_level' => ['provincial'],
        ],
        'national' => [
            'label'       => 'Administration nationale',
            'description' => 'Primature — coordination nationale',
            'redirect'    => '/government/dashboard',
            'roles'       => ['government'],
            'officer_level' => ['national'],
            'exclude_department' => ['expert', 'tutelle', 'budget'],
        ],
    ],
];
