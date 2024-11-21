import { useEffect, useState } from "react";

const PinList = () => {
  const [pins, setPins] = useState([]);
  const [error, setError] = useState(null); // Initialize error state

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/pins", {
          credentials: "include",
        });

        // Parse the JSON response
        const data = await response.json();

        // Ensure data is an array
        if (Array.isArray(data)) {
          setPins(data);
        } else {
          console.error("Fetched data is not an array", data);
          setPins([]); // Handle the case where the data is not an array
        }
      } catch (err) {
        setError("Failed to load pins. Please try again.");
        console.error(err);
      }
    };

    fetchPins();
  }, []);
  return (
    <div className="min-h-screen p-6">
      {/* Check if there is an error */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="bg-black shadow-md rounded-xl overflow-hidden mb-6 break-inside-avoid-column relative group"
          >
            {/* Image with hover effect */}
            <img
              src={pin.imageUrl}
              alt={pin.title}
              className="w-full h-auto object-cover rounded-t-xl transition-opacity duration-300 group-hover:opacity-50"
            />

            {/* Button appears on hover */}
            <button className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#E60023] text-white rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinList;
