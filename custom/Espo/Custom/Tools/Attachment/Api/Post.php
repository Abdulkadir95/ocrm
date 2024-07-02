<?php

namespace Espo\Custom\Tools\Attachment\Api;

use Espo\Core\Api\Action;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\Api\ResponseComposer;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Record\CreateParamsFetcher;
use Espo\Core\Record\Service as RecordService;
use Espo\Core\Record\ServiceContainer;

class Post implements Action
{

    public function __construct(
        private CreateParamsFetcher $createParamsFetcher,
        private ServiceContainer    $recordServiceContainer,
        private EntityManager       $entityManager
    )
    {
    }

    public function process(Request $request): Response
    {
        $data = $request->getParsedBody();
        $dataRequest = $data->data;

        $file = $dataRequest->DocumentAuthentication[0]->Front->Map;
        
        if (empty($file)) {
            return ResponseComposer::json([
                'success' => false,
                'message' => 'No file provided',
            ]);
        }


        $contact = $this->entityManager->CreateEntity('Contact', [
            'firstName' => 'Test',
            'lastName' => 'Test',
            'description' => json_encode($dataRequest)
        ]);


        $file = 'data:image/jpeg;base64,' . $file;

        $data->role = 'Attachment';
        $data->relatedType = 'Contact';
        $data->field = 'document';
        $data->name = 'image.jpeg';
        $data->type = 'image/jpeg';
        $data->size = 2017;
        $data->file = $file;

        $params = $this->createParamsFetcher->fetch($request);
        $entity = $this->getRecordService()->create($data, $params);

        $contact->set('documentId', $entity->getId());

        $contact->set('documentName', $entity->get('name'));
        $this->entityManager->saveEntity($contact);

        $entity->set('relatedId', $contact->getId());
        $entity->set('relatedType', 'Contact');
        $entity->set('relatedName', $contact->get('name'));


        return ResponseComposer::json([
            'field' => $entity->getValueMap(),
            'success' => true,
        ]);
    }

    protected function getRecordService(?string $entityType = null): RecordService
    {
        return $this->recordServiceContainer->get('Attachment');
    }
}