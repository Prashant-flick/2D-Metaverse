import { useState } from 'react';
import { Users, MessageSquare, Settings, Monitor, Mic, Video, Phone, Share2, Grid, Layout } from 'lucide-react';

const GatherTownApp = () => {
  const [activeTab, setActiveTab] = useState('people');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
        <div className="mb-8">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">G</div>
        </div>

        <div className="flex flex-col items-center space-y-6 flex-grow">
          <button 
            className={`p-2 rounded-lg ${activeTab === 'people' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('people')}
          >
            <Users size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${activeTab === 'chat' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={20} />
          </button>
          <button 
            className={`p-2 rounded-lg ${activeTab === 'settings' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col">
        {/* Game Canvas */}
        <div className="flex-grow relative bg-gray-200">
          {/* Virtual Space Grid */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-1 p-4 opacity-10">
            {Array(96).fill(0).map((_, i) => (
              <div key={i} className="border border-gray-400"></div>
            ))}
          </div>

          {/* Characters */}
          <div className="absolute top-1/4 left-1/4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="mt-1 text-xs bg-gray-800 text-white px-2 py-1 rounded text-center">
              Alex
            </div>
          </div>

          <div className="absolute top-1/3 left-1/2">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              Y
            </div>
            <div className="mt-1 text-xs bg-gray-800 text-white px-2 py-1 rounded text-center">
              You
            </div>
          </div>

          <div className="absolute top-1/2 left-1/3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              T
            </div>
            <div className="mt-1 text-xs bg-gray-800 text-white px-2 py-1 rounded text-center">
              Taylor
            </div>
          </div>

          {/* Objects */}
          <div className="absolute top-2/3 left-1/2 w-24 h-12 bg-gray-400 rounded flex items-center justify-center text-xs">
            Table
          </div>
          <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-purple-200 rounded flex items-center justify-center text-xs">
            Whiteboard
          </div>
        </div>

        {/* Controls Bar */}
        <div className="h-16 bg-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              Y
            </div>
            <div className="text-white font-medium">You</div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
              onClick={() => setIsMuted(!isMuted)}
            >
              <Mic size={20} />
            </button>
            <button 
              className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              <Video size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-700 text-white">
              <Monitor size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-700 text-white">
              <Share2 size={20} />
            </button>
            <button className="p-2 rounded-full bg-red-500 text-white">
              <Phone size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded bg-gray-700 text-white">
              <Grid size={20} />
            </button>
            <button className="p-2 rounded bg-gray-700 text-white">
              <Layout size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200">
        {activeTab === 'people' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">People</h2>
            </div>
            <div className="p-4 flex-grow overflow-auto">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    Y
                  </div>
                  <div>
                    <div className="font-medium">You</div>
                    <div className="text-xs text-gray-500">Online</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    A
                  </div>
                  <div>
                    <div className="font-medium">Alex</div>
                    <div className="text-xs text-gray-500">Online</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    T
                  </div>
                  <div>
                    <div className="font-medium">Taylor</div>
                    <div className="text-xs text-gray-500">Online</div>
                  </div>
                </div>
                <div className="flex items-center opacity-50">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    J
                  </div>
                  <div>
                    <div className="font-medium">Jordan</div>
                    <div className="text-xs text-gray-500">Offline</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Chat</h2>
            </div>
            <div className="flex-grow p-4 overflow-auto">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      A
                    </div>
                    <div className="font-medium text-sm">Alex</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 ml-8">
                    Hey everyone! Where should we meet?
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      T
                    </div>
                    <div className="font-medium text-sm">Taylor</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2 ml-8">
                    Let's go to the whiteboard to plan.
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      Y
                    </div>
                    <div className="font-medium text-sm">You</div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-2 ml-8">
                    Sounds good, I'm on my way!
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-gray-200">
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="bg-indigo-600 text-white px-4 rounded-r-lg">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">Settings</h2>
            </div>
            <div className="p-4 overflow-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Video Settings</h3>
                  <select className="w-full p-2 border border-gray-300 rounded">
                    <option>Default Camera</option>
                    <option>External Webcam</option>
                  </select>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Audio Settings</h3>
                  <select className="w-full p-2 border border-gray-300 rounded mb-2">
                    <option>Default Microphone</option>
                    <option>Headset Microphone</option>
                  </select>
                  <select className="w-full p-2 border border-gray-300 rounded">
                    <option>Default Speaker</option>
                    <option>Headphones</option>
                  </select>
                </div>
                <div className="pt-2">
                  <h3 className="font-medium mb-2">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <div className="w-12 h-6 bg-gray-300 rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GatherTownApp;