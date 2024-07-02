<?php

namespace Espo\Custom\Core\FieldProcessing\Contact;
use Espo\Core\FieldProcessing\Loader;
use Espo\Core\FieldProcessing\Loader\Params;
use Espo\ORM\Entity;

class DescriptionLoader implements Loader
{

    public function process(Entity $entity, Params $params): void
    {
        if ($entity->get('description')) {

            $description = $entity->get('description');
            $description = "```\n". $description ." \n```";

            $entity->set('description', $description);

        }
    }
}