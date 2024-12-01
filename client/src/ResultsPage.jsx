import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "./components/ui/card";
import NavigationBar from "./NavigationBar";
import Loader from "./Loader";

const ResultsPage = () => {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const pinId = queryParams.get("pinId");
  const userId = queryParams.get("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/auth/musicAttribute/${pinId}/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pinId, userId]);

  if (loading) return <><Loader/></>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
    <NavigationBar />
    <div className="flex items-center justify-center p-8 gap-8 font-geist bg-gray-900 min-h-screen">
    {/* Left Side: Image in a Card */}
    <Card className="flex-shrink-0 w-96 shadow-lg bg-white mt-14">
      <CardContent className="p-4">
        <img
          src={data.imageUrl}
          alt="Recommendation"
          className="rounded-xl w-full"
        />
      </CardContent>
    </Card>

    {/* Right Side: Recommended Tracks */}
    <div className="flex flex-col w-full max-w-3xl">
      <h2 className="text-xl font-bold mb-3 text-red-600 text-center">
        Recommended Tracks - {data.genre}
      </h2>
      <ul className="w-full space-y-1">
        {data.spotifyTracks.map((track) => (
          <Card key={track.id} className="w-full max-w-xl shadow-md bg-white mx-auto">
            <CardContent className="py-4">
              <p className="font-bold text-sm text-red-600">{track.name}</p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold ">Artist:</span> {track.artist}
              </p>
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm hover:underline"
              >
                Listen on Spotify
              </a>
            </CardContent>
          </Card>
        ))}
      </ul>
    </div>
  </div>
  </>
  );
};

export default ResultsPage;
