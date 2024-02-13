<?php

namespace Espo\Modules\Advanced\Classes\Select\BpmnProcess\PrimaryFilters;

use Espo\Core\Select\Primary\Filter;
use Espo\Modules\Advanced\Entities\BpmnProcess as BpmnProcessEntity;
use Espo\ORM\Query\SelectBuilder as QueryBuilder;

class Ended implements Filter
{
    public function apply(QueryBuilder $queryBuilder): void
    {
        $queryBuilder->where(['status' => BpmnProcessEntity::STATUS_ENDED]);
    }
}
