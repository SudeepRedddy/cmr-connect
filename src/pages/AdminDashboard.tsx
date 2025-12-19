import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Chatbot from '@/components/Chatbot';
import { 
  Shield, Users, GraduationCap, Bell, BarChart3, 
  Plus, Trash2, LogOut, UserPlus, FileText, Calendar
} from 'lucide-react';

interface StudentRecord {
  id: string;
  roll_number: string;
  department: string;
  year: number;
  profiles: { full_name: string; email: string } | null;
}

interface FacultyRecord {
  id: string;
  employee_id: string;
  department: string;
  designation: string;
  profiles: { full_name: string; email: string } | null;
}

interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  created_at: string;
}

interface AnalyticsData {
  total_queries: number;
  student_queries: number;
  faculty_queries: number;
  visitor_queries: number;
}

const AdminDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [faculty, setFaculty] = useState<FacultyRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ 
    total_queries: 0, student_queries: 0, faculty_queries: 0, visitor_queries: 0 
  });
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    email: '', password: '', full_name: '', roll_number: '', department: '', year: '1', section: '', batch_year: new Date().getFullYear().toString()
  });
  
  const [newFaculty, setNewFaculty] = useState({
    email: '', password: '', full_name: '', employee_id: '', department: '', designation: '', specialization: '', qualifications: ''
  });
  
  const [newNotice, setNewNotice] = useState({
    title: '', content: '', priority: 'normal'
  });

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      navigate('/login?type=admin');
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchStudents();
      fetchFaculty();
      fetchNotices();
      fetchAnalytics();
    }
  }, [user, userRole]);

  const fetchStudents = async () => {
    const { data: studentsData } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (studentsData) {
      const studentsWithProfiles = await Promise.all(studentsData.map(async (s) => {
        const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', s.user_id).single();
        return { ...s, profiles: profile };
      }));
      setStudents(studentsWithProfiles as StudentRecord[]);
    }
  };

  const fetchFaculty = async () => {
    const { data: facultyData } = await supabase.from('faculty').select('*').order('created_at', { ascending: false });
    if (facultyData) {
      const facultyWithProfiles = await Promise.all(facultyData.map(async (f) => {
        const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', f.user_id).single();
        return { ...f, profiles: profile };
      }));
      setFaculty(facultyWithProfiles as FacultyRecord[]);
    
    }
  };

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setNotices(data);
  };

  const fetchAnalytics = async () => {
    const { data } = await supabase
      .from('chatbot_analytics')
      .select('user_role');
    
    if (data) {
      const stats = {
        total_queries: data.length,
        student_queries: data.filter(d => d.user_role === 'student').length,
        faculty_queries: data.filter(d => d.user_role === 'faculty').length,
        visitor_queries: data.filter(d => d.user_role === 'visitor').length,
      };
      setAnalytics(stats);
    }
  };

  const handleAddStudent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newStudent.email,
          password: newStudent.password,
          full_name: newStudent.full_name,
          role: 'student',
          additionalData: {
            roll_number: newStudent.roll_number,
            department: newStudent.department,
            year: parseInt(newStudent.year),
            section: newStudent.section || null,
            batch_year: parseInt(newStudent.batch_year)
          }
        }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      toast({ title: "Success", description: "Student added successfully" });
      setIsAddStudentOpen(false);
      setNewStudent({ email: '', password: '', full_name: '', roll_number: '', department: '', year: '1', section: '', batch_year: new Date().getFullYear().toString() });
      fetchStudents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddFaculty = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newFaculty.email,
          password: newFaculty.password,
          full_name: newFaculty.full_name,
          role: 'faculty',
          additionalData: {
            employee_id: newFaculty.employee_id,
            department: newFaculty.department,
            designation: newFaculty.designation,
            specialization: newFaculty.specialization || null,
            qualifications: newFaculty.qualifications || null
          }
        }
      });

      if (error || data?.error) throw new Error(data?.error || error?.message);

      toast({ title: "Success", description: "Faculty added successfully" });
      setIsAddFacultyOpen(false);
      setNewFaculty({ email: '', password: '', full_name: '', employee_id: '', department: '', designation: '', specialization: '', qualifications: '' });
      fetchFaculty();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddNotice = async () => {
    try {
      const { error } = await supabase
        .from('notices')
        .insert({
          title: newNotice.title,
          content: newNotice.content,
          priority: newNotice.priority,
          created_by: user?.id
        });

      if (error) throw error;

      toast({ title: "Success", description: "Notice added successfully" });
      setIsAddNoticeOpen(false);
      setNewNotice({ title: '', content: '', priority: 'normal' });
      fetchNotices();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteNotice = async (id: string) => {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (!error) {
      toast({ title: "Deleted", description: "Notice removed" });
      fetchNotices();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const departments = ['CSE', 'CSE-DS', 'CSE-AIML', 'CSE-CS', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-primary/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">CMRCET Administration</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Queries</p>
                  <p className="text-2xl font-bold">{analytics.total_queries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student Queries</p>
                  <p className="text-2xl font-bold">{analytics.student_queries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faculty Queries</p>
                  <p className="text-2xl font-bold">{analytics.faculty_queries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visitor Queries</p>
                  <p className="text-2xl font-bold">{analytics.visitor_queries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Students</CardTitle>
                  <CardDescription>Add and manage student accounts</CardDescription>
                </div>
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" /> Add Student</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>Create a new student account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Full Name" value={newStudent.full_name} onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} />
                      <Input type="email" placeholder="Email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
                      <Input type="password" placeholder="Password" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} />
                      <Input placeholder="Roll Number" value={newStudent.roll_number} onChange={(e) => setNewStudent({...newStudent, roll_number: e.target.value})} />
                      <Select value={newStudent.department} onValueChange={(v) => setNewStudent({...newStudent, department: v})}>
                        <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={newStudent.year} onValueChange={(v) => setNewStudent({...newStudent, year: v})}>
                        <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Section (optional)" value={newStudent.section} onChange={(e) => setNewStudent({...newStudent, section: e.target.value})} />
                      <Input placeholder="Batch Year" value={newStudent.batch_year} onChange={(e) => setNewStudent({...newStudent, batch_year: e.target.value})} />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddStudent}>Add Student</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {students.length > 0 ? students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{s.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{s.roll_number} • {s.department} • Year {s.year}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No students added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Faculty</CardTitle>
                  <CardDescription>Add and manage faculty accounts</CardDescription>
                </div>
                <Dialog open={isAddFacultyOpen} onOpenChange={setIsAddFacultyOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" /> Add Faculty</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Faculty</DialogTitle>
                      <DialogDescription>Create a new faculty account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Full Name" value={newFaculty.full_name} onChange={(e) => setNewFaculty({...newFaculty, full_name: e.target.value})} />
                      <Input type="email" placeholder="Email" value={newFaculty.email} onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})} />
                      <Input type="password" placeholder="Password" value={newFaculty.password} onChange={(e) => setNewFaculty({...newFaculty, password: e.target.value})} />
                      <Input placeholder="Employee ID" value={newFaculty.employee_id} onChange={(e) => setNewFaculty({...newFaculty, employee_id: e.target.value})} />
                      <Select value={newFaculty.department} onValueChange={(v) => setNewFaculty({...newFaculty, department: v})}>
                        <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Designation" value={newFaculty.designation} onChange={(e) => setNewFaculty({...newFaculty, designation: e.target.value})} />
                      <Input placeholder="Specialization (optional)" value={newFaculty.specialization} onChange={(e) => setNewFaculty({...newFaculty, specialization: e.target.value})} />
                      <Input placeholder="Qualifications (optional)" value={newFaculty.qualifications} onChange={(e) => setNewFaculty({...newFaculty, qualifications: e.target.value})} />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddFaculty}>Add Faculty</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {faculty.length > 0 ? faculty.map((f) => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{f.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{f.employee_id} • {f.department} • {f.designation}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No faculty added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Notices</CardTitle>
                  <CardDescription>Create and manage announcements</CardDescription>
                </div>
                <Dialog open={isAddNoticeOpen} onOpenChange={setIsAddNoticeOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="w-4 h-4 mr-2" /> Add Notice</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Notice</DialogTitle>
                      <DialogDescription>Create a new announcement</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Title" value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} />
                      <Textarea placeholder="Content" value={newNotice.content} onChange={(e) => setNewNotice({...newNotice, content: e.target.value})} rows={4} />
                      <Select value={newNotice.priority} onValueChange={(v) => setNewNotice({...newNotice, priority: v})}>
                        <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddNotice}>Add Notice</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notices.length > 0 ? notices.map((n) => (
                    <div key={n.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          n.priority === 'urgent' ? 'bg-destructive/10' : 
                          n.priority === 'high' ? 'bg-accent/10' : 'bg-muted'
                        }`}>
                          <Bell className={`w-5 h-5 ${
                            n.priority === 'urgent' ? 'text-destructive' : 
                            n.priority === 'high' ? 'text-accent' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{n.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{n.content}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteNotice(n.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No notices yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Analytics</CardTitle>
                <CardDescription>Usage statistics for the AI chatbot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-6 bg-blue-500/10 rounded-lg text-center">
                    <p className="text-4xl font-bold text-blue-600">{analytics.student_queries}</p>
                    <p className="text-sm text-muted-foreground mt-2">Student Queries</p>
                  </div>
                  <div className="p-6 bg-accent/10 rounded-lg text-center">
                    <p className="text-4xl font-bold text-accent">{analytics.faculty_queries}</p>
                    <p className="text-sm text-muted-foreground mt-2">Faculty Queries</p>
                  </div>
                  <div className="p-6 bg-green-500/10 rounded-lg text-center">
                    <p className="text-4xl font-bold text-green-600">{analytics.visitor_queries}</p>
                    <p className="text-sm text-muted-foreground mt-2">Visitor Queries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Chatbot */}
      <Chatbot userRole="visitor" />
    </div>
  );
};

export default AdminDashboard;
