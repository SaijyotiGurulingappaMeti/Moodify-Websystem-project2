import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { useUserInfo } from "./hooks/userInfo";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

const PinList = () => {
  const [pins, setPins] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPins = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch("http://localhost:4000/auth/pins", {
          credentials: "include",
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setPins(data);
        } else {
          console.error("Fetched data is not an array", data);
          setPins([]);
        }
      } catch (err) {
        setError("Failed to load pins. Please try again.");
        console.error(err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchPins();
  }, []);

  const checkIfPinAlreadyExists = async (pinId, userId) => {
    try {
      const response = await fetch("http://localhost:4000/auth/checkPin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinId: pinId,
          userId: userId,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else {
        console.error("Failed to check pin existence");
        return false;
      }
    } catch (err) {
      console.error("Error checking pin existence:", err);
      return false;
    }
  };

  const handleButtonClick = async (id, imageUrl, userId, username) => {
    try {
      const pinExists = await checkIfPinAlreadyExists(id, userId);

      if (pinExists) {
        toast.info("This pin has already been processed.");
        navigate(`/results?pinId=${id}&userId=${userId}`);
      } else {
        const response = await fetch("http://localhost:4000/auth/sendPin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pinId: id,
            imageUrl: imageUrl,
            userId: userId,
            username: username,
          }),
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();

          if (
            data.message ===
              "No faces detected or very low accurate data, please choose another picture" ||
            data.message === "No faces detected" ||
            data.emotion === null
          ) {
            toast.error(data.message);
          } else {
            navigate(
              `/genre?pinId=${id}&userId=${userId}&username=${username}&imageUrl=${imageUrl}&emotion=${data.mostProbableEmotion}`
            );
          }
        } else {
          toast.error("Failed to send pin.");
        }
      }
    } catch (err) {
      toast.error("Error handling button click. Please try again.");
      console.error("Error handling button click:", err);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <ToastContainer position="bottom-right" autoClose={5000} />

      {loading ? (
        <>
          <Loader />
        </>
      ) : error ? (
        <p className="text-red-500 text-center mb-4">{error}</p>
      ) : pins.length === 0 ? (
        <p className="text-gray-500 text-center mb-4">No pins yet!</p>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="bg-black shadow-md rounded-xl overflow-hidden mb-6 break-inside-avoid-column relative group"
            >
              <img
                src={pin.imageUrl}
                alt={pin.title}
                className="w-full h-auto object-cover rounded-t-xl transition-opacity duration-300 group-hover:opacity-50"
              />

              <Button
                onClick={() => {
                  handleButtonClick(
                    pin.id,
                    pin.imageUrl,
                    userInfo.userInfo.id,
                    userInfo.userInfo.username
                  );
                  console.log(pin.id);
                }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#E60023] text-white rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Action
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinList;
