import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { useUserInfo } from "./hooks/userInfo";
import NavigationBar from "./NavigationBar";
import { Button } from "./components/ui/button";

const HistoryPage = () => {
  const { userInfo } = useUserInfo(); // Using custom hook to get userInfo
  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(true);

  // Handle delete function
  const handleDelete = async (trackId) => {
    
    try {
      // Make DELETE request to backend to remove the pin
      const response = await fetch(
        `http://localhost:4000/auth/deleteTracks/${trackId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the track.");
      }

      // Remove the deleted pin from the UI by filtering it out from the state
      setPins((prevPins) => prevPins.filter((pin) => pin.id !== pinId));
      //Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting pin:", error);
    }
  };

  // Only fetch pins if userInfo is available
  useEffect(() => {
    if (userInfo && userInfo.id) {
      fetch(`http://localhost:4000/auth/history/${userInfo.id}`)
        .then((response) => response.json())
        .then((data) => {
          setPins(data);
          setLoadingPins(false);
        })
        .catch((error) => {
          console.error("Error fetching history:", error);
          setLoadingPins(false);
        });
    }
  }, [userInfo]);

  if (loadingPins) {
    return (
      <>
        <NavigationBar />
        <div>Loading pins...</div>
      </>
    );
  }

  // Return "No history found" if no pins are found
  if (!pins.length) {
    return (
      <>
        <NavigationBar />
        <div>No history found.</div>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <div className="pt-24 space-y-6"> {/* Added space-y-6 for spacing between cards */}
        {pins.map((pin) => (
          <Card key={pin.id} className="w-full bg-white text-gray-900 border rounded-md shadow-sm">
            <div className="p-4">
              {/* Pin Genre */}
              <h2 className="text-xl font-bold text-gray-800 mb-4">{pin.genre}</h2>

              <div className="flex items-center space-x-4">
                {/* Image Section */}
                <div className="flex-shrink-0 w-32 h-32">
                  <img
                    src={pin.imageUrl}
                    alt={pin.genre}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                {/* Songs Section */}
                <div className="flex-grow">
                  <ul className="space-y-2">
                    {pin.spotifyTracks.map((track, index) => (
                      <li key={track.id} className="text-gray-700">
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {track.name} by {track.artist}
                        </a>
                        {index < pin.spotifyTracks.length - 1 && <span className="px-2">|</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Delete Button Section */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => handleDelete(pin.id)}
                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
};

export default HistoryPage;
