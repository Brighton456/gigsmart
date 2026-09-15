import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Input, Select, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Simple debounce implementation
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

interface FilterControlsProps {
  onSearch: (value: string) => void;
  onFilter: (filters: any) => void;
  onDateRangeChange: (dates: any) => void;
  loading?: boolean;
  placeholder?: string;
}

const FilterControls: React.FC<FilterControlsProps> = React.memo(({
  onSearch,
  onFilter,
  onDateRangeChange,
  loading = false,
  placeholder = "Search..."
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  useEffect(() => {
    debouncedSearch(searchValue);
  }, [searchValue, debouncedSearch]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  }, [filters, onFilter]);

  return (
    <Space size="small" wrap>
      <Input.Search
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ width: 250 }}
        size="small"
        allowClear
      />
      <RangePicker
        size="small"
        onChange={onDateRangeChange}
        format="YYYY-MM-DD"
      />
      <Select
        placeholder="Status"
        size="small"
        style={{ width: 100 }}
        allowClear
        onChange={(value) => handleFilterChange('status', value)}
      >
        <Option value="active">Active</Option>
        <Option value="inactive">Inactive</Option>
        <Option value="pending">Pending</Option>
      </Select>
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        size="small"
        loading={loading}
      >
        Refresh
      </Button>
    </Space>
  );
});

FilterControls.displayName = 'FilterControls';

export default FilterControls;
