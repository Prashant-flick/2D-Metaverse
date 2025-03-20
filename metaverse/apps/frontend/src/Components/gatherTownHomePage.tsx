import { ArrowRight, Users, Video, Globe, Monitor, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';

const GatherTownHomepage = () => {
  const [isLoggedIn, setIsloggedIn] = useState<boolean>(false)

  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-indigo-600">gather</div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-indigo-600">Product</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600">Pricing</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600">Resources</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600">About</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-indigo-600">Sign in</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Try Gather</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Your Virtual Space to Work, Meet, and Socialize
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Create your own custom virtual space for better team collaboration, 
                engaging events, and meaningful social interactions.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`${isLoggedIn?"/app":"/login"}`)
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-200 rounded-xl overflow-hidden shadow-lg">
                <div className="p-2 bg-gray-300 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-800 p-4 aspect-video">
                  <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
                    {Array(9).fill(0).map((_, i) => (
                      <div key={i} className="bg-gray-700 rounded-md flex items-center justify-center">
                        <Users className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Gather?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our unique spatial interface brings teams together for more natural, human interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Video className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seamless Video</h3>
              <p className="text-gray-600">
                Move around and talk to people nearby, just like in real life. No more awkward video grid layouts.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Spaces</h3>
              <p className="text-gray-600">
                Design your own virtual office, classroom, or event space with our intuitive builder.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Monitor className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Objects</h3>
              <p className="text-gray-600">
                Share screens, collaborate on whiteboards, and interact with embedded apps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 bg-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Perfect For Any Setting</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From small teams to large organizations, Gather helps you create meaningful connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold mb-4">Remote Teams</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Foster spontaneous collaboration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Create a sense of presence and belonging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Reduce meeting fatigue</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold mb-4">Virtual Events</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Host engaging conferences and workshops</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Create networking opportunities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Interactive breakout sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Virtual Space?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams and communities already using Gather.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100">
              Start For Free
            </button>
            <button className="border border-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Enterprise</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold text-white mb-4 md:mb-0">gather</div>
            <div>© {new Date().getFullYear()} Gather. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GatherTownHomepage;