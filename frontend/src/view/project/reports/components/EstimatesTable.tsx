import React from 'react';
import type { AggregateEstimates } from './estimatesConstants';
import { ESTIMATES_ROLES } from './estimatesConstants';

type RoleConfig = { key: keyof AggregateEstimates; label: string };

type Props = {
  estimates: AggregateEstimates | null;
  roles?: RoleConfig[];
  showTotal?: boolean;
  className?: string;
};

const defaultRoles = ESTIMATES_ROLES;

function getTotal(estimates: AggregateEstimates | null, roles: RoleConfig[]): number {
  if (!estimates) return 0;
  return roles.reduce((sum, r) => sum + (estimates[r.key] ?? 0), 0);
}

const EstimatesTable = ({
  estimates,
  roles = defaultRoles,
  showTotal = true,
  className = '',
}: Props) => {
  const total = getTotal(estimates, roles);

  return (
    <table className={`table table-sm table-hover mb-0 ${className}`}>
      <thead>
        <tr>
          <th>Role</th>
          <th className="text-end">Hours</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((r) => (
          <tr key={r.key}>
            <td>{r.label}</td>
            <td className="text-end">
              {estimates ? (estimates[r.key] ?? 0) : 0}
            </td>
          </tr>
        ))}
      </tbody>
      {showTotal && (
        <tfoot>
          <tr className="fw-bold">
            <td>Total</td>
            <td className="text-end">{total}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};

export default EstimatesTable;
