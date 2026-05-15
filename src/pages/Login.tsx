import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
  
}



const Login: React.FC = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const navigate = useNavigate();
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Identifiants invalides';
      
      if (error.code === 'ERR_NETWORK' || error.response?.status === 502) {
        errorMessage = 'Le serveur est temporairement indisponible. Veuillez réessayer dans quelques minutes.';
      } else if (error.response?.data?.detail || error.response?.data?.message) {
        errorMessage = error.response.data.detail || error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/gree.png')" }}
    >

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C+</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CerviCare+</h1>
          <p className="text-gray-600">Plateforme de dépistage du cancer du col</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre espace professionnel</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="form-label">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                className={`input-field ${errors.username ? 'input-error' : ''}`}
                placeholder="Entrez votre nom d'utilisateur"
                {...register('username', {
                  required: 'Le nom d\'utilisateur est requis',
                })}
              />
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field ${errors.password ? 'input-error' : ''} pr-12`}
                  placeholder="Entrez votre mot de passe"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Identifiants de démonstration :
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Admin:</span>
                <span className="font-mono">admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>Superviseur:</span>
                <span className="font-mono">supervisor / supervisor123</span>
              </div>
              <div className="flex justify-between">
                <span>Agent:</span>
                <span className="font-mono">agent / agent123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 CerviCare+ - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;