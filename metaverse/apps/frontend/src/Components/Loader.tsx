import { useLoader } from '../Context/UseLoader'

const Loader = () => {
    const { loading } = useLoader();
    if (!loading) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  };
  
  export default Loader;