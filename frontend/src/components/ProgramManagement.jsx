import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Search, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ code: '', name: '', college_code: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPrograms();
    fetchColleges();
  }, []);

  useEffect(() => {
    const filtered = programs.filter(program =>
      program.code.toLowerCase().includes(search.toLowerCase()) ||
      program.name.toLowerCase().includes(search.toLowerCase()) ||
      program.college_name?.toLowerCase().includes(search.toLowerCase())
    );
    
    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredPrograms(sorted);
  }, [programs, search, sortConfig]);

  const fetchPrograms = async () => {
    try {
      const data = await api.getPrograms(search);
      setPrograms(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch programs');
    }
  };

  const fetchColleges = async () => {
    try {
      const data = await api.getColleges();
      setColleges(data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
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
    if (!formData.college_code) newErrors.college_code = 'College is required';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingProgram) {
        await api.updateProgram(editingProgram.code, formData);
      } else {
        await api.createProgram(formData);
      }
      fetchPrograms();
      closeDialog();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this program? This will also delete all associated students.')) return;
    
    try {
      await api.deleteProgram(code);
      fetchPrograms();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedPrograms.length} programs? This will also delete all associated students.`)) return;
    
    try {
      await api.bulkDeletePrograms(selectedPrograms);
      setSelectedPrograms([]);
      fetchPrograms();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const openDialog = (program = null) => {
    if (program) {
      setEditingProgram(program);
      setFormData({ code: program.code, name: program.name, college_code: program.college_code });
    } else {
      setEditingProgram(null);
      setFormData({ code: '', name: '', college_code: '' });
    }
    setFormErrors({});
    setError('');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProgram(null);
    setFormData({ code: '', name: '', college_code: '' });
    setFormErrors({});
  };

  const toggleSelection = (code) => {
    setSelectedPrograms(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleSelectAll = () => {
    setSelectedPrograms(
      selectedPrograms.length === filteredPrograms.length
        ? []
        : filteredPrograms.map(p => p.code)
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Program Management</h1>
        <p className="text-gray-600">Manage academic programs and their details</p>
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
                  placeholder="Search programs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {selectedPrograms.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedPrograms.length})
                </Button>
              )}
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
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
                      checked={selectedPrograms.length === filteredPrograms.length && filteredPrograms.length > 0}
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
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('college_name')}
                  >
                    College {sortConfig.key === 'college_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No programs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map(program => (
                    <TableRow key={program.code}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedPrograms.includes(program.code)}
                          onChange={() => toggleSelection(program.code)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{program.code}</TableCell>
                      <TableCell>{program.name}</TableCell>
                      <TableCell>{program.college_name}</TableCell>
                      <TableCell>{program.student_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(program.code)}
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
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Add Program'}</DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Update the program information' : 'Create a new program'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Program Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., BSCS"
                  disabled={editingProgram !== null}
                />
                {formErrors.code && <p className="text-red-500 text-sm mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Program Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">College</label>
                <Select
                  value={formData.college_code}
                  onValueChange={(value) => setFormData({ ...formData, college_code: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map(college => (
                      <SelectItem key={college.code} value={college.code}>
                        {college.code} - {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.college_code && <p className="text-red-500 text-sm mt-1">{formErrors.college_code}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProgram ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramManagement;