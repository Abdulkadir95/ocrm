<?php

namespace Espo\Modules\Advanced\Core\Workflow;

use Espo\ORM\Entity;
use Espo\ORM\EntityManager;
use stdClass;

class Utils
{
    /**
     * String to lower case.
     * @todo Revise. Remove?
     */
    public static function strtolower(?string $str): ?string
    {
        if (!empty($str) && !is_array($str)) {
            return mb_strtolower($str, 'UTF-8');
        }

        return $str;
    }

    /**
     * Shift date days.
     *
     * @param integer $shiftDays
     * @param string $time
     * @return string
     */
    public static function shiftDays(
        $shiftDays = 0,
        $time = null,
        $dateType = 'datetime',
        $intervalUnit = 'days',
        $timezone = null,
        $systemTimezone = null
    ) {
        $date = new \DateTime($time);

        if (isset($shiftDays) && $shiftDays != 0) {
            if ($systemTimezone && $dateType === 'datetime') {
                $systemTimezoneObj = new \DateTimeZone($systemTimezone);

                $date->setTimezone($systemTimezoneObj);
            }

            $date->modify($shiftDays. ' ' . $intervalUnit);

            if ($systemTimezone && $dateType === 'datetime') {
                $utcTimezoneObj = new \DateTimeZone('UTC');

                $date->setTimezone($utcTimezoneObj);
            }
        }

        switch ($dateType) {
            case 'datetime':
                $format = 'Y-m-d H:i:s';

                break;

            case 'date':
            default:
                if ($timezone) {
                    $timezoneObj = new \DateTimeZone($timezone);
                    $date->setTimezone($timezoneObj);
                }

                $format = 'Y-m-d';

                break;
        }

        return $date->format($format);
    }

    /**
     * @deprecated
     *
     * Get field value for a field/related field. If this field has a relation, get value from the relation.
     *
     * @param ?string $fieldName
     * @param bool $returnEntity
     * @param ?EntityManager $entityManager
     * @param ?stdClass $createdEntitiesData
     * @return mixed
     */
    public static function getFieldValue(
        Entity $entity,
        $fieldName,
        $returnEntity = false,
        $entityManager = null,
        $createdEntitiesData = null
    ) {

        if (strpos($fieldName, 'created:') === 0) {
            [$alias, $field] = explode('.', substr($fieldName, 8));

            if (!$createdEntitiesData) {
                return null;
            }

            if (!isset($createdEntitiesData->$alias)) {
                return null;
            }

            $entity = $entityManager
                ->getEntity($createdEntitiesData->$alias->entityType, $createdEntitiesData->$alias->entityId);

            if (!$entity) {
                return null;
            }

            $fieldName = $field;
        }
        else if (strstr($fieldName, '.')) {
            list($entityFieldName, $relatedEntityFieldName) = explode('.', $fieldName);

            $relatedEntity = $entity->get($entityFieldName);

            // If entity is just created and doesn't have added relations.
            if (
                isset($entityManager) &&
                !isset($relatedEntity) &&
                $entity->hasRelation($entityFieldName)
            ) {
                $foreignEntityType = $entity->getRelationParam($entityFieldName, 'entity');

                $normalizedEntityFieldName = static::normalizeFieldName($entity, $entityFieldName);

                if (
                    $foreignEntityType &&
                    $entity->hasAttribute($normalizedEntityFieldName) &&
                    $entity->get($normalizedEntityFieldName)
                ) {
                    $relatedEntity = $entityManager
                        ->getEntity($foreignEntityType, $entity->get($normalizedEntityFieldName));
                }
            }

            if ($relatedEntity instanceof Entity) {
                $entity = $relatedEntity;

                $fieldName = $relatedEntityFieldName;
            }
            else {
                $GLOBALS['log']->error(
                    'Workflow [Utils::getFieldValue]: The related field [' . $fieldName . '] entity [' .
                    $entity->getEntityType() . '] has unsupported instance [' .
                    (isset($relatedEntity) ? get_class($relatedEntity) : var_export($relatedEntity, true)) .
                    '].'
                );

                return null;
            }
        }

        if ($entity->hasRelation($fieldName)) {
            $relatedEntity = null;

            if ($entity->getRelationType($fieldName) === 'belongsToParent') {
                if ($entity->get($fieldName . 'Type') && $entity->get($fieldName . 'Id')) {
                    $relatedEntity = $entityManager
                        ->getEntity($entity->get($fieldName . 'Type'), $entity->get($fieldName . 'Id'));
                }
            }
            else {
                $relatedEntity = $entity->get($fieldName);
            }

            if ($relatedEntity && $relatedEntity instanceof Entity) {
                $foreignKey = Utils::getRelationOption($entity, 'foreignKey', $fieldName, 'id');

                return $returnEntity ? $relatedEntity : $relatedEntity->get($foreignKey);
            }

            if (!isset($relatedEntity)) {
                $normalizedFieldName = static::normalizeFieldName($entity, $fieldName);

                if (!$entity->isNew()) {
                    if ($entity->hasRelation($fieldName) && $entity->hasAttribute($fieldName . 'Ids')) {
                        $entity->loadLinkMultipleField($fieldName);
                    }
                }

                $fieldValue = $returnEntity ?
                    static::getParentEntity($entity, $fieldName, $entityManager) :
                    static::getParentValue($entity, $normalizedFieldName);

                if (isset($fieldValue)) {
                    return $fieldValue;
                }
            }

            if ($entity->hasRelation($fieldName) && $entity->hasAttribute($fieldName . 'Ids')) {
                $entity->loadLinkMultipleField($fieldName);
            }

            return $returnEntity ? null : $entity->get($fieldName . 'Ids');
        }

        switch ($entity->getAttributeType($fieldName)) {
            case 'linkParent':
                $fieldName .= 'Id';

                break;
        }

        if ($returnEntity) {
            return $entity;
        }

        if ($entity->hasAttribute($fieldName)) {
            return $entity->get($fieldName);
        }



        return null;
    }

    /**
     * Get parent field value. Works for parent and regular fields,
     *
     * @param string|array $normalizedFieldName
     *
     * @return mixed
     */
    public static function getParentValue(Entity $entity, $normalizedFieldName)
    {
        if (is_array($normalizedFieldName)) {
            $value = [];

            foreach ($normalizedFieldName as $fieldName) {
                if ($entity->hasAttribute($fieldName)) {
                    $value[$fieldName] = $entity->get($fieldName);
                }
            }

            return $value;
        }

        if ($entity->hasAttribute($normalizedFieldName)) {
            return $entity->get($normalizedFieldName);
        }

        return null;
    }

    public static function getParentEntity(Entity $entity, $fieldName, $entityManager)
    {
        if (!$entity->hasRelation($fieldName)) {
            return $entity;
        }

        if ($entityManager instanceof \Espo\Core\ORM\EntityManager) {
            $normalizedFieldName = static::normalizeFieldName($entity, $fieldName);

            $fieldValue = static::getParentValue($entity, $normalizedFieldName);

            if (isset($fieldValue) && is_string($fieldValue)) {
                $fieldEntityDefs = $entityManager->getMetadata()->get($entity->getEntityType());

                if (isset($fieldEntityDefs['relations'][$fieldName]['entity'])) {
                    $fieldEntity = $fieldEntityDefs['relations'][$fieldName]['entity'];

                    return $entityManager->getEntity($fieldEntity, $fieldValue);
                }
            }
        }

        return null;
    }

    /**
     * @param Entity $entity
     * @param string $fieldName
     * @return string
     * @deprecated Use getActualFields in Helper.
     * Normalize field name for fields and relations.
     */
    public static function normalizeFieldName(Entity $entity, $fieldName)
    {
        if ($entity->hasRelation($fieldName)) {
            $type = $entity->getRelationType($fieldName);

            $key = $entity->getRelationParam($fieldName, 'key');

            switch ($type) {
                case 'belongsTo':
                    if ($key) {
                        $fieldName = $key;
                    }

                    break;

                case 'belongsToParent':
                    $fieldName = [
                        $fieldName . 'Id',
                        $fieldName . 'Type',
                    ];

                    break;

                case 'hasChildren':
                case 'hasMany':
                case 'manyMany':
                    $fieldName .= 'Ids';

                    break;
            }
        }
        else {
            if ($entity->hasAttribute($fieldName . 'Id')) {
                $fieldType = $entity->getAttributeParam($fieldName . 'Id', 'fieldType');

                if ($fieldType === 'link' || $fieldType === 'linkParent') {
                    $fieldName = $fieldName . 'Id';
                }
            }
        }

        return $fieldName;
    }

    /**
     * Get option value for the relation.
     *
     * @param string $optionName
     * @param string $relationName
     * @param Entity $entity
     * @param mixed $returns
     * @return mixed
     */
    public static function getRelationOption(Entity $entity, $optionName, $relationName, $returns = null)
    {
        if (!$entity->hasRelation($relationName)) {
            return $returns;
        }

        return $entity->getRelationParam($relationName, $optionName) ?? $returns;
    }

    public static function getAttributeType(Entity $entity, string $name): ?string
    {
        if (!$entity->hasAttribute($name)) {
            $name = static::normalizeFieldName($entity, $name);

            if (!is_string($name)) {
                return null;
            }
        }

        return $entity->getAttributeType($name);
    }
}
