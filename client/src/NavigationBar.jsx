import { BounceLoader } from "react-spinners";
import LogoutButton from "./LogoutButton";
import { useEffect, useState } from "react";

const NavigationBar = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/userinfo", {
          credentials: "include", // Include credentials for session-based auth
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserInfo();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userInfo) {
    return (
      <div
        className="text-center"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <BounceLoader color="red" />
      </div>
    );
  }
  return (
    <div className="w-full">
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 border-b border-gray-300">
        {/* Left: Logout Button */}
        <LogoutButton />
        <div className="flex-1 text-center">
          <span className="font-bold font-doto text-4xl text-red-700 hover:text-[#E60023]">
            Moodify
          </span>
        </div>

        {/* Right: Username and Profile Picture */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-800 ">
            Welcome, {userInfo.username}
          </span>
          <img
            src={userInfo.profile_image}
            alt={`${userInfo.username}'s profile`}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </nav>
    </div>
  );
};

export default NavigationBar;
