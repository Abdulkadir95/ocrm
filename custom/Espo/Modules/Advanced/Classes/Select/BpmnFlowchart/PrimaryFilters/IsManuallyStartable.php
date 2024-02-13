<?php

namespace Espo\Modules\Advanced\Classes\Select\BpmnFlowchart\PrimaryFilters;

use Espo\Core\Select\Primary\Filter;
use Espo\ORM\Query\SelectBuilder as QueryBuilder;

class IsManuallyStartable implements Filter
{
    public function apply(QueryBuilder $queryBuilder): void
    {
        $queryBuilder->where(['isActive' => true]);
    }
}
