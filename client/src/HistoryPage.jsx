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
import Loader from "./Loader";
import { IoMdMusicalNotes } from "react-icons/io";

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
        <div>
          <Loader />
        </div>
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
      <div className="pt-24 space-y-6">
        {pins.map((pin) => (
          <Card
            key={pin.id}
            className="w-full bg-white text-gray-900 border rounded-xl shadow-sm"
          >
            <div className="p-4">
              {/* Pin Genre */}
              <h2 className="text-lg font-bold text-red-600 mb-2 flex items-center space-x-2">
                <IoMdMusicalNotes />
                <span>{pin.genre}</span>
              </h2>

              {/* Grid Layout for Image and Tracks */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
                {/* Image Section */}
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={pin.imageUrl}
                    alt={pin.genre}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Songs Section */}
                <div className="flex flex-wrap gap-2">
                  {pin.spotifyTracks.map((track, index) => (
                    <a
                      key={track.id}
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700 hover:underline whitespace-nowrap"
                    >
                      {track.name} by {track.artist}
                      {index < pin.spotifyTracks.length - 1 && (
                        <span className="px-1">|</span>
                      )}
                    </a>
                  ))}
                </div>

                {/* Delete Button Section */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => handleDelete(pin.id)}
                    className="px-3 py-1 text-white bg-red-500 rounded-xl hover:bg-red-700"
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
