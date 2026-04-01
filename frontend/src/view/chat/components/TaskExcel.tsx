import React, { useMemo } from 'react';
import { ReactGrid, Column, Row, HeaderCell, TextCell } from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';

export type TaskExcelItem = {
    id: string;
    name: string;
    description?: string;
    type?: string;
};

type TaskExcelProps = {
    tasks: TaskExcelItem[];
};

const TaskExcel = ({ tasks }: TaskExcelProps) => {
    const columns: Column[] = useMemo(
        () => [
            { columnId: 'name', width: 220 },
            { columnId: 'description', width: 360 },
            { columnId: 'type', width: 120 },
        ],
        [],
    );

    const rows: Row<HeaderCell | TextCell>[] = useMemo(() => {
        const headerRow: Row<HeaderCell> = {
            rowId: 'header',
            cells: [
                { type: 'header', text: 'Task' },
                { type: 'header', text: 'Description' },
                { type: 'header', text: 'Type' },
            ],
        };

        const taskRows: Row<TextCell>[] = tasks.map((task) => ({
            rowId: task.id,
            cells: [
                {
                    type: 'text',
                    text: task.name || 'Task',
                    nonEditable: true,
                },
                {
                    type: 'text',
                    text: task.description || '',
                    nonEditable: true,
                },
                {
                    type: 'text',
                    text: task.type || 'TASK',
                    nonEditable: true,
                },
            ],
        }));

        return [headerRow, ...taskRows];
    }, [tasks]);

    const tableHeight = Math.min(300, Math.max(120, (rows.length + 1) * 36));

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ height: tableHeight, width: '100%', overflow: 'hidden' }}>
                <ReactGrid columns={columns} rows={rows} enableRangeSelection={false} enableColumnSelection={false} enableRowSelection={false} />
            </div>
        </div>
    );
};

export default TaskExcel;