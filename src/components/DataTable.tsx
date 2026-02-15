import { ReactNode } from 'react';

export interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, emptyMessage }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {emptyMessage || 'No records found.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.headerClassName || ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.header} className={`px-6 py-4 text-sm ${column.className || 'text-gray-700'}`}>
                  {column.cell
                    ? column.cell(row)
                    : column.accessor
                      ? (row[column.accessor] as ReactNode)
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
