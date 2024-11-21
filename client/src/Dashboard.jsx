import { useEffect, useState } from "react";
import NavigationBar from "./NavigationBar";
import PreLoader from "./PreLoader";


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
    return <div
    className="text-center"
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    Loading...
  </div>
  }

  return (
   
    <div className="w-full">

      <NavigationBar />
     
    </div>

  
  );
};

export default Dashboard;
