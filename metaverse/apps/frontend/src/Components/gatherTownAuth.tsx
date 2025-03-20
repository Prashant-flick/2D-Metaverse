import { useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { axios } from '../Axios/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/UseAuth';

const GatherTownAuth = () => {
  const [loginOrSignupPage, setLoginOrSingupPage] = useState<boolean>(true)
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
    role: 'user',
  });
  const navigate = useNavigate();
  const { isLogin, SetAccessToken } = useAuth();

  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitLogin = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
        console.error("invalid fields")
    }

    try {
      const res = await axios.post(`${BackendUrl}/signin`,formData)
      if (res.status!==200) {
          console.error("signin failed", res);
          return
      }
      SetAccessToken(res.data.accessToken)
      navigate('/app')
    } catch (error) {
      console.error("siginIn failed-> ", error);
    }
  };

  const handleSubmitSignUp = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.username || !formData.confirmPassword) {
        console.error("invalid fields")
    }
    if (formData.password !== formData.confirmPassword) {
        console.error("password and ConfirmPassword are different");
    }

    try {
        const res = await axios.post(`${BackendUrl}/signup`, formData)

        if (res.status!==200) {
          console.error("signup failed", res);
          return
        }

        handleSubmitLogin(e);
    } catch (error) {
        console.error("signup failed-> ", error);
    }

  };

  const toggleView = () => {
    setLoginOrSingupPage(!setLoginOrSingupPage);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="text-2xl font-bold text-indigo-600">gather</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? 'Enter your details to access your spaces' : 'Start building your virtual spaces'}
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={loginOrSignupPage ? handleSubmitLogin : handleSubmitSignUp}>
              {!loginOrSignupPage && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required={!isLogin}
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!loginOrSignupPage && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required={!isLogin}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLogin ? (
                    <>
                      Sign in <LogIn size={16} className="ml-2" />
                    </>
                  ) : (
                    <>
                      Create account <UserPlus size={16} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <img src="/api/placeholder/20/20" alt="Google" className="h-5 w-5 mr-2" />
                  {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleView}
                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 sm:mb-0">
            © {new Date().getFullYear()} Gather. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Help Center</a>
            <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GatherTownAuth;