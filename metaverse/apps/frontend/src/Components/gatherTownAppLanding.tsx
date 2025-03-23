import { useState } from 'react';
import { ArrowRight, Users, Calendar, Building, Video, Globe } from 'lucide-react';
import { useAuth } from '../Context/UseAuth';
import { useNavigate, Link } from 'react-router-dom';
import { axios } from '../Axios/axios';

const GatherTownAppLanding = () => {  
  const [spaceCode, setSpaceCode] = useState('');
  const { isLogin, logout } = useAuth();
  const [isNewSpaceFormOpen, setIsNewSpaceFormOpen] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const [newSpaceData, setNewSpaceData] = useState({
    spaceId: "",
    name: "",
    x: "",
    y: "",
    thumbnail: "/thumbnail_empty_space",
    creatorId: "",
  });

  const logOut = async(e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout();
    navigate('/')
  };

  const getRandomString = (length: number) => {
    const characters = "QWREYTOYJLDJSBCMSMZshdfirutowenxvcvnbnzmc1234567890";

    let result = "";
    for (let i=0; i<length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSpaceData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSpace = async(e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSpaceId = getRandomString(5);
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${isNewSpaceFormOpen && 'bg-gray-200'}`}>
      {isNewSpaceFormOpen && (
      <div
        onClick={() => setIsNewSpaceFormOpen(prev=>!prev)}
        className='fixed h-screen w-screen flex justify-center items-center'>
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white w-96 p-6 shadow-lg rounded-lg">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
            onClick={() => setIsNewSpaceFormOpen(false)}
          >
            ✕
          </button>
          <form onSubmit={handleCreateSpace}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={newSpaceData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Dimensions</label>
              <div className="flex gap-2 mt-1">
                <input
                  id="x-dimension"
                  name="x"
                  type="number"
                  min="100"
                  max="800"
                  required
                  value={newSpaceData.x}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Width (x)"
                />
                <input
                  id="y-dimension"
                  name="y"
                  type="number"
                  min="100"
                  max="800"
                  required
                  value={newSpaceData.y}
                  onChange={handleChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Height (y)"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            >
              Create Space
            </button>
          </form>
        </div>
      </div>
      )}
      {/* Header */}
      <header className={`shadow-sm ${isNewSpaceFormOpen ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">gather</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-indigo-600">Help</button>
            <button className="text-gray-600 hover:text-indigo-600">Account</button>
            <button
              onClick={logOut}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-grow flex flex-col`}>
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow flex flex-col">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Gather</h1>
            <p className="text-lg text-gray-600">Join or create a space to get started</p>
          </div>

          {/* Join Section */}
          <div className={`rounded-xl shadow-md p-6 mb-8 ${isNewSpaceFormOpen ? 'bg-gray-50' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Join a Space</h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Enter space code or URL"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={spaceCode}
                onChange={(e) => setSpaceCode(e.target.value)}
              />
              <button 
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                disabled={!spaceCode}
              >
                Join Space <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Recent Spaces */}
          <div className={`rounded-xl shadow-md p-6 mb-8 ${isNewSpaceFormOpen ? 'bg-gray-50' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Recent Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Team Workspace", type: "Work", users: 12, lastVisited: "2 hours ago" },
                { name: "Project Alpha", type: "Meeting", users: 5, lastVisited: "Yesterday" },
                { name: "Virtual Office", type: "Office", users: 24, lastVisited: "3 days ago" }
              ].map((space, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{space.name}</h3>
                      <p className="text-sm text-gray-500">{space.type}</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      <div className="flex items-center">
                        <Users size={12} className="mr-1" />
                        {space.users}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Last visited: {space.lastVisited}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates & Create Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-xl shadow-md p-6 ${isNewSpaceFormOpen ? 'bg-gray-50' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4">Create New Space</h2>
              <p className="text-gray-600 mb-4">Build your own custom virtual space from scratch</p>
              <button
                onClick={()=>setIsNewSpaceFormOpen(prev=>!prev)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 w-full cursor-pointer">
                Create Custom Space
              </button>
            </div>
            <div className={`rounded-xl shadow-md p-6 ${isNewSpaceFormOpen ? 'bg-gray-50' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4">Use a Template</h2>
              <p className="text-gray-600 mb-4">Get started quickly with pre-designed spaces</p>
              <button className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-lg hover:bg-indigo-200 w-full">
                Browse Templates
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className={`rounded-xl shadow-md p-6 ${isNewSpaceFormOpen ? 'bg-gray-50' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Popular Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Office Space", icon: <Building className="h-6 w-6" />, color: "bg-blue-100 text-blue-600" },
                { name: "Conference", icon: <Calendar className="h-6 w-6" />, color: "bg-green-100 text-green-600" },
                { name: "Classroom", icon: <Video className="h-6 w-6" />, color: "bg-yellow-100 text-yellow-600" },
                { name: "Social Space", icon: <Globe className="h-6 w-6" />, color: "bg-purple-100 text-purple-600" }
              ].map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer text-center">
                  <div className={`w-12 h-12 rounded-full ${template.color} flex items-center justify-center mx-auto mb-3`}>
                    {template.icon}
                  </div>
                  <h3 className="font-medium">{template.name}</h3>
                </div>
              ))}
            </div>
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
            <a href="#" className="text-gray-500 hover:text-indigo-600">Help Center</a>
            <a href="#" className="text-gray-500 hover:text-indigo-600">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-indigo-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GatherTownAppLanding;