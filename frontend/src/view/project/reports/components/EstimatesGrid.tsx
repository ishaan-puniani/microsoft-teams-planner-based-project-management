import React, { useMemo } from 'react';
import {
  ReactGrid,
  Column,
  Row,
  HeaderCell,
  TextCell,
  NumberCell,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import type { AggregateEstimates } from './estimatesConstants';
import { ESTIMATES_ROLES } from './estimatesConstants';

type RoleConfig = { key: keyof AggregateEstimates; label: string };

type Props = {
  /** Aggregate of saved estimatedTime (current estimates) */
  estimates: AggregateEstimates | null;
  /** Aggregate of suggestedEstimatedTime.low */
  suggestedLow?: AggregateEstimates | null;
  /** Aggregate of suggestedEstimatedTime.ideal (AI suggested ideal hours) */
  suggestedIdeal?: AggregateEstimates | null;
  /** Aggregate of suggestedEstimatedTime.high */
  suggestedHigh?: AggregateEstimates | null;
  roles?: RoleConfig[];
  showTotal?: boolean;
  className?: string;
};

const ROLE_COLUMN_ID = 'role';
const ESTIMATED_COLUMN_ID = 'estimated';
const SUGGESTED_LOW_COLUMN_ID = 'suggestedLow';
const IDEAL_COLUMN_ID = 'ideal';
const SUGGESTED_HIGH_COLUMN_ID = 'suggestedHigh';
const DEVIATION_COLUMN_ID = 'deviation';

const defaultRoles = ESTIMATES_ROLES;

function getTotal(estimates: AggregateEstimates | null, roles: RoleConfig[]): number {
  if (!estimates) return 0;
  return roles.reduce((sum, r) => sum + (estimates[r.key] ?? 0), 0);
}

/** Deviation = estimated - ideal. Positive = over estimate, negative = under. */
function getDeviationStyle(deviation: number): React.CSSProperties | undefined {
  if (deviation > 0) return { backgroundColor: 'rgba(220, 53, 69, 0.15)' };
  if (deviation < 0) return { backgroundColor: 'rgba(25, 135, 84, 0.15)' };
  return undefined;
}

const EstimatesGrid = ({
  estimates,
  suggestedLow = null,
  suggestedIdeal = null,
  suggestedHigh = null,
  roles = defaultRoles,
  showTotal = true,
  className = '',
}: Props) => {
  const columns: Column[] = useMemo(
    () => [
      { columnId: ROLE_COLUMN_ID, width: 160, resizable: true },
      { columnId: ESTIMATED_COLUMN_ID, width: 100, resizable: true },
      { columnId: SUGGESTED_LOW_COLUMN_ID, width: 100, resizable: true },
      { columnId: IDEAL_COLUMN_ID, width: 100, resizable: true },
      { columnId: SUGGESTED_HIGH_COLUMN_ID, width: 100, resizable: true },
      { columnId: DEVIATION_COLUMN_ID, width: 100, resizable: true },
    ],
    [],
  );

  const rows = useMemo((): Row[] => {
    const headerRow: Row = {
      rowId: 'header',
      cells: [
        { type: 'header', text: 'Role' } as HeaderCell,
        { type: 'header', text: 'Estimated (hrs)' } as HeaderCell,
        { type: 'header', text: 'Suggested Low (hrs)' } as HeaderCell,
        { type: 'header', text: 'Ideal (hrs)' } as HeaderCell,
        { type: 'header', text: 'Suggested High (hrs)' } as HeaderCell,
        { type: 'header', text: 'Deviation' } as HeaderCell,
      ],
    };

    const dataRows: Row[] = roles.map((r) => {
      const estimatedVal = estimates ? (estimates[r.key] ?? 0) : 0;
      const lowVal = suggestedLow ? (suggestedLow[r.key] ?? 0) : 0;
      const idealVal = suggestedIdeal ? (suggestedIdeal[r.key] ?? 0) : 0;
      const highVal = suggestedHigh ? (suggestedHigh[r.key] ?? 0) : 0;
      const deviation = estimatedVal - idealVal;
      const deviationStyle = getDeviationStyle(deviation);

      return {
        rowId: r.key,
        cells: [
          { type: 'text', text: r.label, nonEditable: true } as TextCell,
          { type: 'number', value: estimatedVal, nonEditable: true } as NumberCell,
          { type: 'number', value: deviation, nonEditable: true, style: deviationStyle } as NumberCell,
          { type: 'number', value: idealVal, nonEditable: true } as NumberCell,
          { type: 'number', value: lowVal, nonEditable: true } as NumberCell,
          { type: 'number', value: highVal, nonEditable: true } as NumberCell,
        ],
      };
    });

    if (!showTotal) {
      return [headerRow, ...dataRows];
    }

    const totalEstimated = getTotal(estimates, roles);
    const totalLow = getTotal(suggestedLow ?? null, roles);
    const totalIdeal = getTotal(suggestedIdeal ?? null, roles);
    const totalHigh = getTotal(suggestedHigh ?? null, roles);
    const totalDeviation = totalEstimated - totalIdeal;
    const totalDeviationStyle = getDeviationStyle(totalDeviation);

    const totalRow: Row = {
      rowId: 'total',
      cells: [
        { type: 'text', text: 'Total', nonEditable: true, style: { fontWeight: 'bold' } } as TextCell,
        { type: 'number', value: totalEstimated, nonEditable: true, style: { fontWeight: 'bold' } } as NumberCell,
        { type: 'number', value: totalDeviation, nonEditable: true, style: { fontWeight: 'bold', ...totalDeviationStyle } } as NumberCell,
        { type: 'number', value: totalIdeal, nonEditable: true, style: { fontWeight: 'bold' } } as NumberCell,
        { type: 'number', value: totalLow, nonEditable: true, style: { fontWeight: 'bold' } } as NumberCell,
        { type: 'number', value: totalHigh, nonEditable: true, style: { fontWeight: 'bold' } } as NumberCell,
      ],
    };

    return [headerRow, ...dataRows, totalRow];
  }, [estimates, suggestedLow, suggestedIdeal, suggestedHigh, roles, showTotal]);

  return (
    <div className={`reactgrid-wrapper ${className}`} style={{ minHeight: 80 }}>
      <ReactGrid
        columns={columns}
        rows={rows}
        enableRangeSelection={true}
        enableColumnResizeOnAllHeaders
        
      />
    </div>
  );
};

export default EstimatesGrid;
