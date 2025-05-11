import { ArrowRight, Users, Video, Globe, Monitor, CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/UseAuth";
import { useEffect } from "react";

const GatherTownHomepage = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const FirstVisit = sessionStorage.getItem("firstVisit");

    if (!FirstVisit && isLogin) {
      sessionStorage.setItem("firstVisit", "true");
      navigate("/app", { replace: true });
    }
  }, [isLogin, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            Gather village
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
            Product
          </a>
          <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
            Pricing
          </a>
          <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
            Resources
          </a>
          <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
            About
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to={isLogin ? "/app" : "/login"}
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Sign in
          </Link>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-lg">
            Try Gather
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 px-6 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Your Virtual Space to Work, Meet, and Socialize
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Create your own custom virtual space for better team collaboration, engaging events,
                and meaningful social interactions.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`${isLogin ? "/app" : "/login"}`);
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-500 flex items-center justify-center shadow-lg transition-colors"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button className="border border-purple-400 text-purple-400 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                <div className="p-2 bg-gray-700 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-900 p-4 aspect-video">
                  <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
                    {Array(9)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-800 rounded-md flex items-center justify-center border border-gray-700"
                        >
                          <Users className="text-purple-400" />
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
      <section className="py-16 px-6 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Why Choose Gather?</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Our unique spatial interface brings teams together for more natural, human
              interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-colors shadow-lg">
              <div className="bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Video className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Seamless Video</h3>
              <p className="text-gray-300">
                Move around and talk to people nearby, just like in real life. No more awkward video
                grid layouts.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-colors shadow-lg">
              <div className="bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Globe className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Custom Spaces</h3>
              <p className="text-gray-300">
                Design your own virtual office, classroom, or event space with our intuitive
                builder.
              </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-colors shadow-lg">
              <div className="bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Monitor className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Interactive Objects</h3>
              <p className="text-gray-300">
                Share screens, collaborate on whiteboards, and interact with embedded apps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 bg-gray-900 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Perfect For Any Setting</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From small teams to large organizations, Gather helps you create meaningful
              connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-white">Remote Teams</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Foster spontaneous collaboration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Create a sense of presence and belonging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Reduce meeting fatigue</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-white">Virtual Events</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Host engaging conferences and workshops</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Create networking opportunities</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Interactive breakout sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-purple-900 text-white border-t border-purple-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Virtual Space?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of teams and communities already using Gather.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-purple-900 px-8 py-3 rounded-lg font-medium hover:bg-purple-100 transition-colors shadow-lg">
              Start For Free
            </button>
            <button className="border border-white px-8 py-3 rounded-lg font-medium hover:bg-purple-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold text-purple-400 mb-4 md:mb-0">gather</div>
            <div className="text-gray-500">
              © {new Date().getFullYear()} Gather. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GatherTownHomepage;
