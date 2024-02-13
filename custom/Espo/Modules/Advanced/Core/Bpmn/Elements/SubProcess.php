<?php

namespace Espo\Modules\Advanced\Core\Bpmn\Elements;

use Espo\Modules\Advanced\Core\Bpmn\Utils\Helper;

use Espo\Modules\Advanced\Entities\BpmnFlowchart;
use Espo\Modules\Advanced\Entities\BpmnFlowNode;
use Espo\Modules\Advanced\Entities\BpmnProcess;

use Throwable;
use stdClass;

class SubProcess extends CallActivity
{
    public function process(): void
    {
        if ($this->isMultiInstance()) {
            $this->processMultiInstance();

            return;
        }

        $target = $this->getNewTargetEntity();

        if (!$target) {
            $GLOBALS['log']->info("BPM Sub-Process: Could not get target for sub-process.");

            $this->fail();

            return;
        }

        $flowNode = $this->getFlowNode();
        $variables = $this->getPrepareVariables();

        $this->refreshProcess();

        $parentFlowchartData = $this->getProcess()->get('flowchartData') ?? (object) [];

        $createdEntitiesData = clone $this->getCreatedEntitiesData();

        $eData = Helper::getElementsDataFromFlowchartData((object) [
            'list' => $this->getAttributeValue('dataList') ?? [],
        ]);

        $flowchart = $this->getEntityManager()->getEntity(BpmnFlowchart::ENTITY_TYPE);

        $flowchart->set([
            'targetType' => $target->getEntityType(),
            'data' => (object) [
                'createdEntitiesData' => $parentFlowchartData->createdEntitiesData ?? (object) [],
                'list' => $this->getAttributeValue('dataList') ?? [],
            ],
            'elementsDataHash' => $eData['elementsDataHash'],
            'hasNoneStartEvent' => count($eData['eventStartIdList']) > 0,
            'eventStartIdList'=> $eData['eventStartIdList'],
            'teamsIds' => $this->getProcess()->getLinkMultipleIdList('teams'),
            'assignedUserId' => $this->getProcess()->get('assignedUserId'),
            'name' => $this->getAttributeValue('title') ?? 'Sub-Process',
        ]);

        /** @var BpmnProcess $subProcess */
        $subProcess = $this->getEntityManager()->createEntity(BpmnProcess::ENTITY_TYPE, [
            'status' => BpmnFlowNode::STATUS_CREATED,
            'targetId' => $target->get('id'),
            'targetType' => $target->getEntityType(),
            'parentProcessId' => $this->getProcess()->get('id'),
            'parentProcessFlowNodeId' => $flowNode->get('id'),
            'rootProcessId' => $this->getProcess()->getRootProcessId(),
            'assignedUserId' => $this->getProcess()->get('assignedUserId'),
            'teamsIds' => $this->getProcess()->getLinkMultipleIdList('teams'),
            'variables' => $variables,
            'createdEntitiesData' => $createdEntitiesData,
            'startElementId' => $this->getSubProcessStartElementId(),
        ], [
            'skipCreatedBy' => true,
            'skipModifiedBy' => true,
            'skipStartProcessFlow' => true,
        ]);

        $flowNode->set([
            'status' => BpmnFlowNode::STATUS_IN_PROCESS,
        ]);

        $flowNode->setDataItemValue('subProcessId', $subProcess->get('id'));

        $this->getEntityManager()->saveEntity($flowNode);

        try {
            $this->getManager()->startCreatedProcess($subProcess, $flowchart);
        }
        catch (Throwable $e) {
            $GLOBALS['log']->error("BPM Sub-Process: Starting sub-process failure, {$subProcess->get('id')}. " .
                $e->getMessage());

            $this->fail();

            return;
        }
    }

    protected function getSubProcessStartElementId(): ?string
    {
        return null;
    }

    protected function generateSubProcessMultiInstance(int $loopCounter, int $x, int $y): stdClass
    {
        return (object) [
            'type' => $this->getAttributeValue('type'),
            'id' => self::generateElementId(),
            'center' => (object) [
                'x' => $x + 125,
                'y' => $y,
            ],
            'dataList' => $this->getAttributeValue('dataList'),
            'returnVariableList' => $this->getAttributeValue('returnVariableList'),
            'isExpanded' => false,
            'target' => $this->getAttributeValue('target'),
            'targetType' => $this->getAttributeValue('targetType'),
            'targetIdExpression' => $this->getAttributeValue('targetIdExpression'),
            'isMultiInstance' => false,
            'triggeredByEvent' => false,
            'isSequential' => false,
            'loopCollectionExpression' => null,
            'text' => (string) $loopCounter,
        ];
    }
}
