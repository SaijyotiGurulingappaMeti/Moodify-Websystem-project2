import { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { useUserInfo } from "./hooks/userInfo";

const HistoryPage = () => {
  const { userInfo } = useUserInfo(); // Using custom hook to get userInfo
  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(true);

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
    return <div>Loading pins...</div>;
  }

  // Return "No history found" if no pins are found
  if (!pins.length) {
    return <div>No history found.</div>;
  }

  return (
    <div className="flex flex-wrap justify-center">
      {pins.map((pin) => (
        <Card key={pin.id} className="m-4 w-80 bg-white text-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{pin.genre}</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={pin.imageUrl}
              alt={pin.genre}
              className="w-full h-40 object-cover rounded-md"
            />
            <ul className="mt-4">
              {pin.spotifyTracks.map((track) => (
                <li key={track.id} className="mb-2">
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {track.name} by {track.artist}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <span className="text-sm text-gray-600">Pin ID: {pin.pinId}</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default HistoryPage;
