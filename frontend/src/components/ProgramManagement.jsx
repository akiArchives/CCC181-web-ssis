import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmationContext';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  
  const [formData, setFormData] = useState({ code: '', name: '', college_code: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchPrograms();
  }, [currentPage, itemsPerPage, sortConfig]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const displayedPrograms = programs;

  const fetchPrograms = async () => {
    try {
      const response = await api.getPrograms(search, '', currentPage, itemsPerPage, sortConfig);
      setPrograms(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (err) {
      addToast('Failed to fetch programs', 'error');
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await api.getColleges('', 1, 100);
      setColleges(response.data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchPrograms();
    } else {
      setCurrentPage(1);
    }
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
      addToast(editingProgram ? 'Program updated successfully' : 'Program created successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (code) => {
    if (!await confirm({
      title: 'Delete Program',
      message: 'Are you sure you want to delete this program? This will also delete all associated students.'
    })) return;
    
    try {
      await api.deleteProgram(code);
      fetchPrograms();
      addToast('Program deleted successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!await confirm({
      title: 'Bulk Delete Programs',
      message: `Delete ${selectedPrograms.length} programs? This will also delete all associated students.`
    })) return;
    
    try {
      await api.bulkDeletePrograms(selectedPrograms);
      setSelectedPrograms([]);
      fetchPrograms();
      addToast(`${selectedPrograms.length} programs deleted successfully`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
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
      selectedPrograms.length === programs.length
        ? []
        : programs.map(p => p.code)
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Program Management</h1>
      </div>

      <Card className="w-full bg-[#F7F5F0] border-[#004643]/10">
        <CardHeader className="shrink-0">
          <div className="flex items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#004643]/50 h-4 w-4" />
                <Input
                  placeholder="Search programs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-[#004643]/20 focus-visible:ring-[#004643]"
                />
            </form>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
              {selectedPrograms.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedPrograms.length})
                </Button>
              )}
              <Button onClick={() => openDialog()} className="bg-[#004643] hover:bg-[#004643]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Program
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
                      checked={selectedPrograms.length === programs.length && programs.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('code')}
                  >
                    Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('college_name')}
                  >
                    College {sortConfig.key === 'college_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No programs found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedPrograms.map(program => (
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
                            variant="ghost"
                            className="text-gray-500 hover:text-[#004643] hover:bg-[#004643]/10"
                            onClick={() => openDialog(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
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
        <DialogContent className="bg-[#F7F5F0] border-[#004643]/10">
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
              <Button type="button" variant="outline" onClick={closeDialog} className="border-[#004643]/20 text-[#004643] hover:bg-[#004643]/10 hover:text-[#004643]">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#004643] hover:bg-[#004643]/90">
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