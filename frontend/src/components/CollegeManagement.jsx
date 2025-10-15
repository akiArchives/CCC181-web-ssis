import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const CollegeManagement = () => {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
  const { addToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchColleges();
  }, [currentPage, itemsPerPage]);

  const displayedColleges = React.useMemo(() => {
    return [...colleges].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [colleges, sortConfig]);

  const fetchColleges = async () => {
    try {
      const response = await api.getColleges(search, currentPage, itemsPerPage);
      setColleges(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (err) {
      addToast('Failed to fetch colleges', 'error');
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchColleges();
    } else {
      setCurrentPage(1);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCollege) {
        await api.updateCollege(editingCollege.code, formData);
      } else {
        await api.createCollege(formData);
      }
      fetchColleges();
      closeDialog();
      addToast(editingCollege ? 'College updated successfully' : 'College created successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this college? This will also delete all associated programs and students.')) return;
    
    try {
      await api.deleteCollege(code);
      fetchColleges();
      addToast('College deleted successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedColleges.length} colleges? This will also delete all associated programs and students.`)) return;
    
    try {
      await api.bulkDeleteColleges(selectedColleges);
      setSelectedColleges([]);
      fetchColleges();
      addToast(`${selectedColleges.length} colleges deleted successfully`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openDialog = (college = null) => {
    if (college) {
      setEditingCollege(college);
      setFormData({ code: college.code, name: college.name });
    } else {
      setEditingCollege(null);
      setFormData({ code: '', name: '' });
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCollege(null);
    setFormData({ code: '', name: '' });
    setFormErrors({});
  };

  const toggleSelection = (code) => {
    setSelectedColleges(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    setSelectedColleges(
      selectedColleges.length === colleges.length
        ? []
        : colleges.map(c => c.code)
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold mb-2">College Management</h1>
        <p className="text-gray-600">Manage academic colleges and their information</p>
      </div>

      <Card className="w-full">
        <CardHeader className="shrink-0">
          <div className="flex items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search colleges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
            </form>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
              {selectedColleges.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedColleges.length})
                </Button>
              )}
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add College
              </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedColleges.length === colleges.length && colleges.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('code')}
                  >
                    Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedColleges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No colleges found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedColleges.map(college => (
                    <TableRow key={college.code}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedColleges.includes(college.code)}
                          onChange={() => toggleSelection(college.code)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{college.code}</TableCell>
                      <TableCell>{college.name}</TableCell>
                      <TableCell>{college.program_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(college)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(college.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCollege ? 'Edit College' : 'Add College'}</DialogTitle>
            <DialogDescription>
              {editingCollege ? 'Update the college information' : 'Create a new college'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">College Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., CCS"
                  disabled={editingCollege !== null}
                />
                {formErrors.code && <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">College Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., College of Computer Studies"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCollege ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollegeManagement;