import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Chatbot from '@/components/Chatbot';
import { 
  GraduationCap, BookOpen, Calendar, Bell, User, LogOut, 
  TrendingUp, Clock, Award, FileText
} from 'lucide-react';

interface StudentData {
  roll_number: string;
  department: string;
  year: number;
  section: string | null;
  batch_year: number;
  attendance_percentage: number;
  cgpa: number;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string | null;
}

const StudentDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [profileData, setProfileData] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'student')) {
      navigate('/login?type=student');
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchNotices();
      fetchEvents();
      fetchProfile();
    }
  }, [user]);

  const fetchStudentData = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (data) setStudentData(data);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user?.id)
      .single();
    
    if (data) setProfileData(data);
  };

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setNotices(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(5);
    
    if (data) setEvents(data);
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

  const yearText = studentData ? ['First', 'Second', 'Third', 'Fourth'][studentData.year - 1] + ' Year' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Student Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {profileData?.full_name || 'Student'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="w-20 h-20 bg-primary/20 rounded-full mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {profileData?.full_name?.charAt(0) || 'S'}
                  </span>
                </div>
                <h3 className="font-semibold">{profileData?.full_name || 'Student'}</h3>
                <p className="text-sm text-muted-foreground">{profileData?.email}</p>
              </div>
              
              {studentData && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Roll Number</span>
                    <span className="font-medium">{studentData.roll_number}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{studentData.department}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Year</span>
                    <span className="font-medium">{yearText}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Section</span>
                    <span className="font-medium">{studentData.section || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Batch</span>
                    <span className="font-medium">{studentData.batch_year}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Stats */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Academic Performance
              </CardTitle>
              <CardDescription>Your current academic standing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="text-2xl font-bold text-green-600">
                        {studentData?.attendance_percentage || 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CGPA</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {studentData?.cgpa || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>View Timetable</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Exam Schedule</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Results</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notices */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Notices & Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className={`p-3 rounded-lg border ${
                        notice.priority === 'urgent' ? 'bg-destructive/5 border-destructive/20' :
                        notice.priority === 'high' ? 'bg-accent/5 border-accent/20' :
                        'bg-muted/50 border-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{notice.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          notice.priority === 'urgent' ? 'bg-destructive/20 text-destructive' :
                          notice.priority === 'high' ? 'bg-accent/20 text-accent' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {notice.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No notices at the moment</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.event_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      {event.venue && (
                        <p className="text-xs text-muted-foreground">📍 {event.venue}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8 text-sm">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot userRole="student" />
    </div>
  );
};

export default StudentDashboard;
