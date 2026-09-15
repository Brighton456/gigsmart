import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Table, Spin, Empty } from 'antd';

// Fallback for when react-window is not available
const List = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

interface VirtualizedTableProps {
  columns: any[];
  dataSource: any[];
  loading?: boolean;
  height?: number;
  rowHeight?: number;
  onRowClick?: (record: any) => void;
  pagination?: any;
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = React.memo(({
  columns,
  dataSource,
  loading = false,
  height = 400,
  rowHeight = 54,
  onRowClick,
  pagination
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use virtualization only for large datasets
  const shouldVirtualize = dataSource.length > 100 && windowWidth > 768;

  const Row = useCallback(({ index, style }: any) => {
    const record = dataSource[index];
    if (!record) return null;

    return (
      <div style={style} className="virtual-row">
        <div
          className="virtual-row-content"
          onClick={() => onRowClick?.(record)}
          style={{ cursor: onRowClick ? 'pointer' : 'default' }}
        >
          {columns.map((col, colIndex) => (
            <div
              key={col.key || colIndex}
              className="virtual-cell"
              style={{
                width: col.width || 150,
                padding: '8px 12px',
                borderRight: '1px solid #f0f0f0',
                display: 'inline-block',
                verticalAlign: 'top'
              }}
            >
              {col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}
            </div>
          ))}
        </div>
      </div>
    );
  }, [dataSource, columns, onRowClick]);

  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.width || 150), 0);
  }, [columns]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dataSource.length) {
    return <Empty description="No data available" />;
  }

  if (shouldVirtualize) {
    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ width: totalWidth, minWidth: '100%' }}>
          <List
            height={height}
            itemCount={dataSource.length}
            itemSize={rowHeight}
            width={totalWidth}
          >
            {Row}
          </List>
        </div>
      </div>
    );
  }

  // Use regular table for smaller datasets
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      scroll={{ x: totalWidth, y: height }}
      size="small"
      rowKey="id"
    />
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;
