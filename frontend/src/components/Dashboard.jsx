import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_programs: 0,
    total_colleges: 0
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getStatistics();
      setStats(data);
    } catch (error) {
      addToast('Failed to fetch dashboard statistics', 'error');
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.total_students,
      icon: Users,
      description: 'Enrolled students',
      color: 'text-[#004643]'
    },
    {
      title: 'Total Programs',
      value: stats.total_programs,
      icon: GraduationCap,
      description: 'Available programs',
      color: 'text-[#004643]'
    },
    {
      title: 'Total Colleges',
      value: stats.total_colleges,
      icon: Building2,
      description: 'Academic colleges',
      color: 'text-[#004643]'
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Student Information System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-[#F7F5F0] border-[#004643]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-[#F7F5F0] border-[#004643]/10">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Navigate to manage students, programs, and colleges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>• Use the navigation tabs above to switch between sections</p>
            <p>• Click on table headers to sort data</p>
            <p>• Use the search bar to filter records</p>
            <p>• Select multiple rows to perform bulk operations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;