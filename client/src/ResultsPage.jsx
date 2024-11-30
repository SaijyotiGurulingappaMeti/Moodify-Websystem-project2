import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col items-center p-4 font-geist">
      <img
        src={data.imageUrl}
        alt="Recommendation"
        className="rounded-lg w-96 mb-4"
      />
      <h2 className="text-2xl font-bold mb-4">Recommended Tracks</h2>
      <ul className="w-full max-w-md">
        {data.spotifyTracks.map((track) => (
          <li
            key={track.id}
            className="p-2 bg-gray-100 rounded-lg mb-2 shadow-md"
          >
            <p className="font-bold">{track.name}</p>
            <p>Artist: {track.artist}</p>
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Listen on Spotify
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultsPage;
