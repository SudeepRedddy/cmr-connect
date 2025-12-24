import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Chatbot from '@/components/Chatbot';
import FacultyLiveChat from '@/components/FacultyLiveChat';
import { 
  Users, BookOpen, Calendar, Bell, User, LogOut, 
  Briefcase, FileText, GraduationCap, Clock
} from 'lucide-react';

interface FacultyData {
  employee_id: string;
  department: string;
  designation: string;
  specialization: string | null;
  qualifications: string | null;
  experience_years: number;
  publications_count: number;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

const FacultyDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [profileData, setProfileData] = useState<{ full_name: string; email: string } | null>(null);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'faculty')) {
      navigate('/login?type=faculty');
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFacultyData();
      fetchNotices();
      fetchProfile();
    }
  }, [user]);

  const fetchFacultyData = async () => {
    const { data } = await supabase
      .from('faculty')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setFacultyData(data);
      setFacultyId(data.id);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Faculty Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {profileData?.full_name || 'Faculty'}</p>
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
                <User className="w-5 h-5 text-accent" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <div className="w-20 h-20 bg-accent/20 rounded-full mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-accent">
                    {profileData?.full_name?.charAt(0) || 'F'}
                  </span>
                </div>
                <h3 className="font-semibold">{profileData?.full_name || 'Faculty'}</h3>
                <p className="text-sm text-muted-foreground">{profileData?.email}</p>
                {facultyData && (
                  <p className="text-sm text-accent font-medium mt-1">{facultyData.designation}</p>
                )}
              </div>
              
              {facultyData && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Employee ID</span>
                    <span className="font-medium">{facultyData.employee_id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{facultyData.department}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{facultyData.experience_years} years</span>
                  </div>
                  {facultyData.specialization && (
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Specialization</span>
                      <span className="font-medium">{facultyData.specialization}</span>
                    </div>
                  )}
                  {facultyData.qualifications && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Qualifications</span>
                      <span className="font-medium">{facultyData.qualifications}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Overview
              </CardTitle>
              <CardDescription>Your teaching and research summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Publications</p>
                      <p className="text-2xl font-bold text-primary">
                        {facultyData?.publications_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="text-2xl font-bold text-accent">
                        {facultyData?.experience_years || 0} yrs
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>My Courses</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Timetable</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>My Students</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Administrative */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Administrative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 justify-start">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Leave Application</p>
                    <p className="text-xs text-muted-foreground">Apply for leave</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start">
                  <FileText className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Mark Attendance</p>
                    <p className="text-xs text-muted-foreground">Student attendance</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notices */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notices
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
                      <h4 className="font-medium text-sm">{notice.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8 text-sm">No notices</p>
              )}
            </CardContent>
          </Card>

          {/* Live Chat */}
          {facultyId && facultyData && (
            <Card className="lg:col-span-3">
              <FacultyLiveChat 
                facultyId={facultyId} 
                facultyDepartment={facultyData.department} 
              />
            </Card>
          )}
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot userRole="faculty" />
    </div>
  );
};

export default FacultyDashboard;
