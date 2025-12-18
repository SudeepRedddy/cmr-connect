import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Users, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type LoginType = 'student' | 'faculty' | 'admin';

const Login = () => {
  const [searchParams] = useSearchParams();
  const loginType = (searchParams.get('type') as LoginType) || 'student';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userRole) {
      const dashboardPath = userRole === 'admin' ? '/admin' : 
                           userRole === 'student' ? '/student' : '/faculty';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, userRole, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Login successful",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLoginConfig = () => {
    switch (loginType) {
      case 'student':
        return {
          title: 'Student Login',
          description: 'Access your student dashboard',
          icon: GraduationCap,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
      case 'faculty':
        return {
          title: 'Faculty Login',
          description: 'Access your faculty dashboard',
          icon: Users,
          color: 'text-accent',
          bgColor: 'bg-accent/10',
        };
      case 'admin':
        return {
          title: 'Admin Login',
          description: 'Access administration panel',
          icon: Shield,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
        };
      default:
        return {
          title: 'Login',
          description: 'Access your dashboard',
          icon: GraduationCap,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
        };
    }
  };

  const config = getLoginConfig();
  const IconComponent = config.icon;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
              <IconComponent className={`w-8 h-8 ${config.color}`} />
            </div>
            <CardTitle className="text-2xl font-display">{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-center text-muted-foreground">
                Don't have access? Contact the administration.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center gap-4">
          {loginType !== 'student' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login?type=student')}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Student
            </Button>
          )}
          {loginType !== 'faculty' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login?type=faculty')}
            >
              <Users className="w-4 h-4 mr-2" />
              Faculty
            </Button>
          )}
          {loginType !== 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login?type=admin')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
