import React, { useState } from "react";
import FacebookLogin from "react-facebook-login";
// import { FacebookLoginButton } from "react-social-login-buttons";
// import { LoginSocialFacebook } from "reactjs-social-login";
// import MyFacebookLoginButton from "./MyFacebookLoginButton";
import axios from "axios";
function FacebookAuth() {
  const [userData, setUserData] = useState(null);

  const responseFacebook = async (response) => {
    console.log(response);
    console.log(response.accessToken);
    // Store the user data in the state variable
    setUserData({
      name: response.name,
      picture: response.picture?.data?.url || null,
    });

    axios({
      method: "POST",
      url: "http://localhost:5000/api/facebook-login",
      data: { accessToken: response.accessToken, userId: response.userId },
    }).then((response) => {
      console.log("Facebook Login success", response);
    });
  };

  return (
    <div>
      {!userData ? (
        <FacebookLogin
          appId="568493799063960"
          autoLoad={true}
          fields="id,name,picture,posts{name,link}"
          icon="fa-facebook"
          callback={responseFacebook}
        />
      ) : (
        ""
      )}
      {userData ? (
        <div>
          <h3 color="white">{userData.name}</h3>
          {userData.picture && <img src={userData.picture} alt="Profile" />}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default FacebookAuth;
