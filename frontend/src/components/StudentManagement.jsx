import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmationContext';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    year_level: '',
    gender: '',
    program_code: '',
    photo_url: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [currentPage, itemsPerPage, sortConfig]);

  useEffect(() => {
    fetchPrograms();
    fetchColleges();
  }, []);

  const displayedStudents = students;

  const fetchStudents = async () => {
    try {
      console.log('Fetching students with sort:', sortConfig);
      const response = await api.getStudents({ search }, currentPage, itemsPerPage, sortConfig);
      setStudents(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (err) {
      addToast('Failed to fetch students', 'error');
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.getPrograms('', '', 1, 100);
      setPrograms(response.data);
    } catch (err) {
      console.error('Error fetching programs:', err);
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
      fetchStudents();
    } else {
      setCurrentPage(1);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id.trim()) newErrors.id = 'Student ID is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.year_level) newErrors.year_level = 'Year level is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.program_code) newErrors.program_code = 'Program is required';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let finalPhotoUrl = formData.photo_url;

      if (photoFile) {
        finalPhotoUrl = await api.uploadStudentPhoto(photoFile);
      }

      const studentData = { ...formData, photo_url: finalPhotoUrl };

      if (editingStudent) {
        if (editingStudent.id !== studentData.id) {
          if (!await confirm({
            title: 'Update Student ID',
            message: `Are you sure you want to change the Student ID from ${editingStudent.id} to ${studentData.id}?`
          })) return;
        }
        await api.updateStudent(editingStudent.id, studentData);
      } else {
        await api.createStudent(studentData);
      }
      fetchStudents();
      closeDialog();
      addToast(editingStudent ? 'Student updated successfully' : 'Student created successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm({
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student?'
    })) return;
    
    try {
      await api.deleteStudent(id);
      fetchStudents();
      addToast('Student deleted successfully', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!await confirm({
      title: 'Bulk Delete Students',
      message: `Delete ${selectedStudents.length} students?`
    })) return;
    
    try {
      await api.bulkDeleteStudents(selectedStudents);
      setSelectedStudents([]);
      fetchStudents();
      addToast(`${selectedStudents.length} students deleted successfully`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const openDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        year_level: student.year_level.toString(),
        gender: student.gender,
        program_code: student.program_code,
        photo_url: student.photo_url || ''
      });
      setPhotoPreview(student.photo_url || null);
    } else {
      setEditingStudent(null);
      setFormData({
        id: '',
        first_name: '',
        last_name: '',
        year_level: '',
        gender: '',
        program_code: '',
        photo_url: ''
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({
      id: '',
      first_name: '',
      last_name: '',
      year_level: '',
      gender: '',
      program_code: '',
      photo_url: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleSelection = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === students.length
        ? []
        : students.map(s => s.id)
    );
  };

  const getYearLevelBadge = (year) => {
    const colors = {
      1: 'bg-[#004643]/10 text-[#004643]',
      2: 'bg-[#004643]/20 text-[#004643]',
      3: 'bg-[#004643]/30 text-[#004643]',
      4: 'bg-[#004643]/40 text-[#004643]'
    };
    return colors[year] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold mb-1">Student Management</h1>
      </div>

      <Card className="w-full bg-[#F7F5F0] border-[#004643]/10">
        <CardHeader className="shrink-0">
          <div className="flex items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#004643]/50 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-[#004643]/20 focus-visible:ring-[#004643]"
                />
            </form>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
              {selectedStudents.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedStudents.length})
                </Button>
              )}
              <Button onClick={() => openDialog()} className="bg-[#004643] hover:bg-[#004643]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
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
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('id')}
                  >
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('first_name')}
                  >
                    First Name {sortConfig.key === 'first_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('last_name')}
                  >
                    Last Name {sortConfig.key === 'last_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('year_level')}
                  >
                    Year Level {sortConfig.key === 'year_level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('gender')}
                  >
                    Gender {sortConfig.key === 'gender' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('program_code')}
                  >
                    Program {sortConfig.key === 'program_code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-[#004643]/5"
                    onClick={() => handleSort('college_code')}
                  >
                    College {sortConfig.key === 'college_code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleSelection(student.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="h-10 w-10 rounded-full bg-[#004643]/10 flex items-center justify-center border border-[#004643]/10 overflow-hidden">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt="Student" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-6 w-6 text-[#004643]/50" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>{student.first_name}</TableCell>
                      <TableCell>{student.last_name}</TableCell>
                      <TableCell>
                        <Badge className={getYearLevelBadge(student.year_level)}>
                          Year {student.year_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>{student.program_code}</TableCell>
                      <TableCell title={student.college_name}>{student.college_code}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-[#004643] hover:bg-[#004643]/10"
                            onClick={() => openDialog(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(student.id)}
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
        <DialogContent className="max-w-2xl bg-[#F7F5F0] border-[#004643]/10">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Update the student information' : 'Create a new student record'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center gap-4 my-4">
              <div className="h-24 w-24 rounded-full bg-[#004643]/10 flex items-center justify-center border border-[#004643]/10 overflow-hidden relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-[#004643]/50" />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full max-w-xs cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Student ID</label>
                <Input
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  placeholder="e.g., 2021-0001"
                />
                {formErrors.id && <p className="text-red-500 text-sm mt-1">{formErrors.id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="e.g., Juan"
                />
                {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="e.g., Dela Cruz"
                />
                {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Year Level</label>
                <Select
                  value={formData.year_level}
                  onValueChange={(value) => setFormData({ ...formData, year_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.year_level && <p className="text-red-500 text-sm mt-1">{formErrors.year_level}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Program</label>
                <Select
                  value={formData.program_code}
                  onValueChange={(value) => setFormData({ ...formData, program_code: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(program => (
                      <SelectItem key={program.code} value={program.code}>
                        {program.code} - {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.program_code && <p className="text-red-500 text-sm mt-1">{formErrors.program_code}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} className="border-[#004643]/20 text-[#004643] hover:bg-[#004643]/10 hover:text-[#004643]">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#004643] hover:bg-[#004643]/90">
                {editingStudent ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;