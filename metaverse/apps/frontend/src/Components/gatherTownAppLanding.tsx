import { useEffect, useState } from "react";
import { ArrowRight, Calendar, Building, Video, Globe, Ellipsis } from "lucide-react";
import { useAuth } from "../Context/UseAuth";
import { useNavigate, Link } from "react-router-dom";
import { axios } from "../Axios/axios";
import { config } from "../config";

interface userSpaceProps {
  id: string;
  name: string;
  dimensions: string;
  thumbnail: string;
  ownerId: string;
}

interface mapProps {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
  elements: {
    id: string;
    mapId: string;
    elementId: string;
    x: number;
    y: number;
  }[];
}

const GatherTownAppLanding = () => {
  const [spaceCode, setSpaceCode] = useState("");
  const { logout, accessToken, isLogin, userId } = useAuth();
  const [isNewSpaceFormOpen, setIsNewSpaceFormOpen] = useState<boolean>(false);
  const [isShowMapsOpen, setIsShowMapsOpen] = useState<boolean>(false);
  const [showSpaceOptionsId, setShowSpaceOptionsId] = useState<string>("");
  const navigate = useNavigate();
  const [userSpaces, setUserSpaces] = useState<[] | userSpaceProps[]>();
  const [maps, setMap] = useState<mapProps[]>([]);
  console.log(userSpaces);

  useEffect(() => {
    if (!isLogin) {
      navigate("/");
    }
  }, [isLogin, navigate]);

  useEffect(() => {
    if (accessToken) {
      const findspaces = async () => {
        try {
          const res = await axios.get(`${config.BackendUrl}/space/recentSpaces`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          setUserSpaces(res.data.spaces);
        } catch (error) {
          console.error(error);
        }
      };
      findspaces();

      const findMaps = async () => {
        const mapsRes = await axios.get(`${config.BackendUrl}/map/all`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setMap(mapsRes.data.mapRes);
      };
      findMaps();
    }
  }, [accessToken]);

  const [newSpaceData, setNewSpaceData] = useState({
    spaceId: "",
    name: "",
    x: 200,
    y: 200,
    dimensions: "",
    thumbnail: "/thumbnail_office",
  });

  const logOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout();
    navigate("/");
  };

  const getRandomString = (length: number) => {
    const characters = "QWREYTOYJLDJSBCMSMZshdfirutowenxvcvnbnzmc1234567890";

    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSpaceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSpace = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const newSpaceId = getRandomString(5);
      newSpaceData.spaceId = newSpaceId;
      newSpaceData.thumbnail = "thumbnail2";
      if (!newSpaceData.name || !newSpaceData.thumbnail || !newSpaceData.x || !newSpaceData.y) {
        console.error("all feilds are required");
        return;
      }
      newSpaceData.dimensions = newSpaceData.x.toString() + "x" + newSpaceData.y.toString();

      const res = await axios.post(`${config.BackendUrl}/space`, newSpaceData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 200) {
        navigate(`/app/space/${res.data.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinSpace = (spaceId: string) => {
    navigate(`/app/space/${spaceId}`);
  };

  const handleCreateSpaceUsingPreBuildMaps = async (mapId: string, name: string) => {
    if (!mapId) {
      console.error("no MapID");
      return;
    }

    try {
      await axios.post(
        `${config.BackendUrl}/space`,
        {
          mapId,
          name,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("space creation success");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSpaceDel = async (spaceId: string) => {
    if (spaceId && accessToken) {
      try {
        await axios.delete(`${config.BackendUrl}/space/${spaceId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        localStorage.removeItem(`prev${spaceId}`);
        localStorage.removeItem(`${spaceId}`);
        setUserSpaces((prev) => prev?.filter((space) => space.id !== spaceId));
        setShowSpaceOptionsId("");
      } catch {
        console.log("space deletion failed");
      }
    }
  };

  const handleSpaceLeave = async (spaceId: string) => {
    if (accessToken && spaceId) {
      try {
        await axios.post(
          `${config.BackendUrl}/space/leaveRoom/${spaceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setUserSpaces((prev) => prev?.filter((space) => space.id !== spaceId));
        setShowSpaceOptionsId("");
      } catch (error) {
        console.log("leaving room failed");
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-900 flex flex-col ${isNewSpaceFormOpen && "bg-gray-800"}`}
    >
      {isNewSpaceFormOpen && (
        <div
          onClick={() => setIsNewSpaceFormOpen((prev) => !prev)}
          className="fixed h-screen w-screen flex justify-center items-center bg-black bg-opacity-70 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gray-800 w-96 p-6 shadow-lg rounded-lg border border-gray-700"
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 cursor-pointer p-1"
              onClick={() => setIsNewSpaceFormOpen(false)}
            >
              ✕
            </button>
            <form onSubmit={handleCreateSpace}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={newSpaceData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300">Dimensions</label>
                <div className="flex gap-2 mt-1">
                  <input
                    id="x-dimension"
                    name="x"
                    type="number"
                    min="200"
                    max="2000"
                    required
                    value={newSpaceData.x}
                    onChange={handleChange}
                    className="w-1/2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Width (x)"
                  />
                  <input
                    id="y-dimension"
                    name="y"
                    type="number"
                    min="200"
                    max="2000"
                    required
                    value={newSpaceData.y}
                    onChange={handleChange}
                    className="w-1/2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Height (y)"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
              >
                Create Space
              </button>
            </form>
          </div>
        </div>
      )}

      {isShowMapsOpen && (
        <div
          onClick={() => setIsShowMapsOpen((prev) => !prev)}
          className="fixed h-screen w-screen flex justify-center items-center bg-black bg-opacity-70 z-50"
        >
          {maps &&
            maps.length &&
            maps.map((map: mapProps) => {
              console.log(map.thumbnail);

              return (
                <div
                  onClick={() => {
                    handleCreateSpaceUsingPreBuildMaps(map.id, map.name);
                  }}
                  key={map.id}
                  className="relative bg-gray-800 w-96 p-6 shadow-2xl shadow-black rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-200"
                >
                  <div className="flex-col justify-center items-center w-full text-center">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 cursor-pointer p-1 font-bold"
                      onClick={() => setIsNewSpaceFormOpen(false)}
                    >
                      ✕
                    </button>
                    <img
                      className="pt-3 rounded-lg"
                      src={map.thumbnail}
                      alt="no thumbnail Available"
                    />
                    <h2 className="font-bold text-2xl text-gray-200 mt-3">
                      {map.name} / {map.dimensions}
                    </h2>
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {/* Header */}
      <header
        className={`shadow-md border-b border-gray-800 ${isNewSpaceFormOpen ? "bg-gray-900" : "bg-gray-800"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
            >
              Gather village
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
              Help
            </button>
            <button className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
              Account
            </button>
            <button
              onClick={logOut}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-grow flex flex-col`}>
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow flex flex-col">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Welcome to Gather</h1>
            <p className="text-lg text-gray-400">Join or create a space to get started</p>
          </div>

          {/* Join Section */}
          <div
            className={`rounded-xl shadow-md p-6 mb-8 border border-gray-700 ${isNewSpaceFormOpen ? "bg-gray-800" : "bg-gray-800"}`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Join a Space</h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Enter space code or URL"
                className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={spaceCode}
                onChange={(e) => setSpaceCode(e.target.value)}
              />
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!spaceCode}
                onClick={(e) => {
                  e.preventDefault();
                  handleJoinSpace(spaceCode);
                }}
              >
                Join Space <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Recent Spaces */}
          <div
            className={`rounded-xl shadow-md p-6 mb-8 border border-gray-700 ${isNewSpaceFormOpen ? "bg-gray-800" : "bg-gray-800"}`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-200">My Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSpaces &&
                userSpaces.length &&
                userSpaces.map((space, index) => (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      handleJoinSpace(space.id);
                    }}
                    key={index}
                    className="relative border border-gray-700 rounded-lg p-4 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-900/30 transition-all cursor-pointer bg-gray-800"
                  >
                    <Ellipsis
                      onClick={(e) => {
                        e.stopPropagation();
                        if (showSpaceOptionsId && showSpaceOptionsId === space.id) {
                          setShowSpaceOptionsId("");
                        } else if (showSpaceOptionsId) {
                          setShowSpaceOptionsId(space.id);
                        } else {
                          setShowSpaceOptionsId(space.id);
                        }
                      }}
                      className="absolute right-2 top-1 text-gray-400 hover:text-gray-300"
                    />
                    {showSpaceOptionsId && showSpaceOptionsId === space.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-8 top-2 flex flex-col border-2 border-gray-700 bg-gray-800 w-24 rounded-md overflow-hidden shadow-lg z-10"
                      >
                        {userId === space.ownerId ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleSpaceDel(space.id);
                            }}
                            className="text-red-500 hover:bg-gray-700 py-2 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleSpaceLeave(space.id);
                            }}
                            className="text-red-500 hover:bg-gray-700 py-2 transition-colors duration-200"
                          >
                            Leave Room
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col justify-between items-center pt-3">
                      <img
                        className="mb-3 h-[200px] w-full object-cover rounded-lg border border-gray-700"
                        src={
                          space.thumbnail === "thumbnail1"
                            ? "/thumbnail_empty_space.jpg"
                            : space.thumbnail === "thumbnail2"
                              ? "/thumbnail_office.png"
                              : ""
                        }
                        alt="NO thumbnail found"
                      />
                      <h1 className="text-xl font-semibold text-gray-200">{space.name}</h1>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Templates & Create Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div
              className={`rounded-xl shadow-md p-6 border border-gray-700 ${isNewSpaceFormOpen ? "bg-gray-800" : "bg-gray-800"}`}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-200">Create New Space</h2>
              <p className="text-gray-400 mb-4">Build your own custom virtual space from scratch</p>
              <button
                onClick={() => setIsNewSpaceFormOpen((prev) => !prev)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 w-full cursor-pointer"
              >
                Create Custom Space
              </button>
            </div>
            <div
              className={`rounded-xl shadow-md p-6 border border-gray-700 ${isNewSpaceFormOpen ? "bg-gray-800" : "bg-gray-800"}`}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-200">Use a Template</h2>
              <p className="text-gray-400 mb-4">Get started quickly with pre-designed spaces</p>
              <button
                onClick={() => setIsShowMapsOpen((prev) => !prev)}
                className="bg-gray-700 text-indigo-400 px-6 py-2 rounded-lg hover:bg-gray-700 hover:text-indigo-300 transition-colors duration-200 w-full border border-gray-600"
              >
                Browse Templates
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div
            className={`rounded-xl shadow-md p-6 border border-gray-700 ${isNewSpaceFormOpen ? "bg-gray-800" : "bg-gray-800"}`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Popular Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Office Space",
                  icon: <Building className="h-6 w-6" />,
                  color: "bg-blue-900 text-blue-400",
                },
                {
                  name: "Conference",
                  icon: <Calendar className="h-6 w-6" />,
                  color: "bg-green-900 text-green-400",
                },
                {
                  name: "Classroom",
                  icon: <Video className="h-6 w-6" />,
                  color: "bg-yellow-900 text-yellow-400",
                },
                {
                  name: "Social Space",
                  icon: <Globe className="h-6 w-6" />,
                  color: "bg-purple-900 text-purple-400",
                },
              ].map((template, index) => (
                <div
                  key={index}
                  className="border border-gray-700 rounded-lg p-4 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-900/20 transition-all cursor-pointer text-center bg-gray-800"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${template.color} flex items-center justify-center mx-auto mb-3`}
                  >
                    {template.icon}
                  </div>
                  <h3 className="font-medium text-gray-300">{template.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 sm:mb-0">
            © {new Date().getFullYear()} Gather. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
            >
              Help Center
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GatherTownAppLanding;
