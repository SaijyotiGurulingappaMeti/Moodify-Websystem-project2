import { useEffect, useState } from "react";

const Dashboard = () => {
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {userInfo.username}</h1>
      <p>ID: {userInfo.id}</p>
      <p>
        profile image:
        <img
          src={userInfo.profile_image}
          alt={`${userInfo.username}'s profile`}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            alignItems: "center",
          }}
        />
      </p>
    </div>
  );
};

export default Dashboard;
