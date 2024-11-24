import { useEffect, useState } from "react";

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [userInfoError, setUserInfoError] = useState(null);
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/userinfo", {
          credentials: "include",
        });
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setUserInfoError(err.message);
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, userInfoError };
};
