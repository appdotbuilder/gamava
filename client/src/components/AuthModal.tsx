
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  onModeSwitch: (mode: 'login' | 'register') => void;
}

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  confirmPassword: string;
}

export function AuthModal({
  isOpen,
  mode,
  onClose,
  onLogin,
  onRegister,
  onModeSwitch
}: AuthModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!formData.first_name) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name) {
        newErrors.last_name = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name
        });
      }
      
      // Reset form on success
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ 
        email: mode === 'login' ? 'Invalid email or password' : 'Registration failed' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const switchMode = () => {
    onModeSwitch(mode === 'login' ? 'register' : 'login');
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {mode === 'login' ? (
                <User size={28} className="text-white" />
              ) : (
                <UserPlus size={28} className="text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back!' : 'Join Gamava'}
            </CardTitle>
            <p className="text-gray-400">
              {mode === 'login' 
                ? 'Sign in to access your account' 
                : 'Create your account to get started'
              }
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name" className="text-gray-300">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('first_name', e.target.value)
                      }
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="last_name" className="text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('last_name', e.target.value)
                      }
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleInputChange('email', e.target.value)
                    }
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleInputChange('password', e.target.value)
                    }
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Mode Switch */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={switchMode}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Demo Note */}
            <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-blue-400 text-sm text-center">
                <strong>Demo:</strong> Authentication is currently in development.
                {mode === 'login' && ' Try creating an account instead.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
