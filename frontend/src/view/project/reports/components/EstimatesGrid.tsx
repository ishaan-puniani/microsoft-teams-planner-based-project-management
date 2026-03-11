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
  estimates: AggregateEstimates | null;
  roles?: RoleConfig[];
  showTotal?: boolean;
  className?: string;
};

const ROLE_COLUMN_ID = 'role';
const HOURS_COLUMN_ID = 'hours';

const defaultRoles = ESTIMATES_ROLES;

function getTotal(estimates: AggregateEstimates | null, roles: RoleConfig[]): number {
  if (!estimates) return 0;
  return roles.reduce((sum, r) => sum + (estimates[r.key] ?? 0), 0);
}

const EstimatesGrid = ({
  estimates,
  roles = defaultRoles,
  showTotal = true,
  className = '',
}: Props) => {
  const columns: Column[] = useMemo(
    () => [
      { columnId: ROLE_COLUMN_ID, width: 180, resizable: true },
      { columnId: HOURS_COLUMN_ID, width: 100, resizable: true },
    ],
    [],
  );

  const rows = useMemo((): Row[] => {
    const headerRow: Row = {
      rowId: 'header',
      cells: [
        { type: 'header', text: 'Role' } as HeaderCell,
        { type: 'header', text: 'Hours' } as HeaderCell,
      ],
    };

    const dataRows: Row[] = roles.map((r, idx) => ({
      rowId: r.key,
      cells: [
        {
          type: 'text',
          text: r.label,
          nonEditable: true,
        } as TextCell,
        {
          type: 'number',
          value: estimates ? (estimates[r.key] ?? 0) : 0,
          nonEditable: true,
        } as NumberCell,
      ],
    }));

    if (!showTotal) {
      return [headerRow, ...dataRows];
    }

    const total = getTotal(estimates, roles);
    const totalRow: Row = {
      rowId: 'total',
      cells: [
        {
          type: 'text',
          text: 'Total',
          nonEditable: true,
          style: { fontWeight: 'bold' },
        } as TextCell,
        {
          type: 'number',
          value: total,
          nonEditable: true,
          style: { fontWeight: 'bold' },
        } as NumberCell,
      ],
    };

    return [headerRow, ...dataRows, totalRow];
  }, [estimates, roles, showTotal]);

  return (
    <div className={`reactgrid-wrapper ${className}`} style={{ minHeight: 80 }}>
      <ReactGrid
        columns={columns}
        rows={rows}
        enableRangeSelection={false}
        enableColumnResizeOnAllHeaders
      />
    </div>
  );
};

export default EstimatesGrid;
