import { useState } from 'react';
import { ArrowRight, Users, Calendar, Building, Video, Globe } from 'lucide-react';
import { useAuth } from '../Context/UseAuth';

const GatherTownAppLanding = () => {
  const [spaceCode, setSpaceCode] = useState('');
  const { isLogin } = useAuth();
  console.log(isLogin);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-indigo-600">gather</div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-indigo-600">Help</button>
            <button className="text-gray-600 hover:text-indigo-600">Account</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow flex flex-col">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Gather</h1>
            <p className="text-lg text-gray-600">Join or create a space to get started</p>
          </div>

          {/* Join Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Space</h2>
              <p className="text-gray-600 mb-4">Build your own custom virtual space from scratch</p>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 w-full">
                Create Custom Space
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Use a Template</h2>
              <p className="text-gray-600 mb-4">Get started quickly with pre-designed spaces</p>
              <button className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-lg hover:bg-indigo-200 w-full">
                Browse Templates
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="bg-white rounded-xl shadow-md p-6">
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