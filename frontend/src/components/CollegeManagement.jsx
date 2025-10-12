import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Search, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

const CollegeManagement = () => {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    const filtered = colleges.filter(college =>
      college.code.toLowerCase().includes(search.toLowerCase()) ||
      college.name.toLowerCase().includes(search.toLowerCase())
    );
    
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredColleges(sorted);
  }, [colleges, search, sortConfig]);

  const fetchColleges = async () => {
    try {
      const data = await api.getColleges(search);
      setColleges(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch colleges');
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
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
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this college? This will also delete all associated programs and students.')) return;
    
    try {
      await api.deleteCollege(code);
      fetchColleges();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedColleges.length} colleges? This will also delete all associated programs and students.`)) return;
    
    try {
      await api.bulkDeleteColleges(selectedColleges);
      setSelectedColleges([]);
      fetchColleges();
      setError('');
    } catch (err) {
      setError(err.message);
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
    setError('');
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
      selectedColleges.length === filteredColleges.length
        ? []
        : filteredColleges.map(c => c.code)
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">College Management</h1>
        <p className="text-gray-600">Manage academic colleges and their information</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search colleges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedColleges.length === filteredColleges.length && filteredColleges.length > 0}
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
                {filteredColleges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No colleges found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredColleges.map(college => (
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