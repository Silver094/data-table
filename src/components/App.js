import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
  TablePagination,
  IconButton,
  Collapse,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Slider,
  Menu,
  MenuItem,
} from '@mui/material';
import { ExpandLess, ExpandMore, FilterList as FilterListIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [grouping, setGrouping] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [salePriceRange, setSalePriceRange] = useState([0, 1000]);

  useEffect(() => {
    fetch('/sample-data.json')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFullData(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'subcategory', header: 'Subcategory' },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: info => {
          const date = new Date(info.getValue());
          return date.toLocaleString();
        },
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated At',
        cell: info => {
          const date = new Date(info.getValue());
          return date.toLocaleString();
        },
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: info => `$${info.getValue()}`,
        sortingFn: 'basic',
      },
      {
        accessorKey: 'sale_price',
        header: 'Sale Price',
        cell: info => `$${info.getValue()}`,
        sortingFn: 'basic',
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return fullData.filter(row => {
      const price = row.price || 0;
      const salePrice = row.sale_price || 0;
      const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
      const inSalePriceRange = salePrice >= salePriceRange[0] && salePrice <= salePriceRange[1];
      return columns.some(column => {
        const value = row[column.accessorKey];
        return inPriceRange && inSalePriceRange && value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [fullData, searchQuery, priceRange, salePriceRange, columns]);

  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    state: { sorting, grouping },
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pageSize),
  });

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGroupBy = (columnId) => {
    if (grouping.includes(columnId)) {
      setGrouping(grouping.filter(g => g !== columnId));
    } else {
      setGrouping([...grouping, columnId]);
    }
    handleMenuClose();
  };

  const clearGrouping = () => {
    setGrouping([]);
  };

  const toggleExpand = (rowId) => {
    setExpanded(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="app-container">
      <div className="search-and-drawer-container">
        <TextField
          label="Search"
          variant="outlined"
          className="search-field"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<FilterListIcon />}
          onClick={toggleDrawer}
          className="group-by-button"
        >
          Menu
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() === 'asc' ? 'asc' : 'desc'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽'
                        ) : null}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map(row => (
              <React.Fragment key={row.id}>
                {row.getIsGrouped() ? (
                  <React.Fragment>
                    <TableRow onClick={() => toggleExpand(row.id)} style={{ cursor: 'pointer' }}>
                      <TableCell colSpan={columns.length}>
                        <IconButton size="small">
                          {expanded[row.id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                        <strong>{row.subRows.length} {row.id}</strong>
                      </TableCell>
                    </TableRow>
                    {expanded[row.id] && (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <Table>
                            <TableBody>
                              {row.subRows.map(subRow => (
                                <TableRow key={subRow.id}>
                                  {subRow.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ) : (
                  <TableRow>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={table.getRowModel().rows.length}
        page={pageIndex}
        onPageChange={(event, newPage) => setPageIndex(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={event => {
          setPageSize(parseInt(event.target.value, 10));
          setPageIndex(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <div role="presentation" className="drawer-content">
          <List className="dropdown-container">
            <ListItem button onClick={handleMenuClick}>
              <ListItemText primary="Group By" />
              <MoreVertIcon />
            </ListItem>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleGroupBy('category')}>Category</MenuItem>
              <MenuItem onClick={() => handleGroupBy('subcategory')}>Subcategory</MenuItem>
            </Menu>
          </List>
          <Button
            variant="contained"
            color="secondary"
            onClick={clearGrouping}
            className="clear-group-button"
          >
            Clear Group By
          </Button>
          <Divider />
          <h3 className="drawer-header drawer-section">Filter by Price</h3>
          <Slider
            value={priceRange}
            onChange={(event, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            className="price-slider"
          />
          <h3 className="drawer-header drawer-section">Filter by Sale Price</h3>
          <Slider
            value={salePriceRange}
            onChange={(event, newValue) => setSalePriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            className="price-slider"
          />
        </div>
      </Drawer>
    </div>
  );
}

export default App;
