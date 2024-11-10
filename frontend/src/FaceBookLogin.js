import React, { useState } from "react";
import FacebookLogin from "react-facebook-login";
// import { FacebookLoginButton } from "react-social-login-buttons";
// import { LoginSocialFacebook } from "reactjs-social-login";
// import MyFacebookLoginButton from "./MyFacebookLoginButton";
function FacebookAuth() {
  const [userData, setUserData] = useState(null);

  const responseFacebook = (response) => {
    console.log(response);
    // Store the user data in the state variable
    setUserData({
      name: response.name,
      picture: response.picture?.data?.url || null,
    });
  };

  return (
    <div>
      {!userData ? (
        <FacebookLogin
          appId="1003774381513068"
          autoLoad={true}
          fields="id,name,picture"
          icon="fa-facebook"
          callback={responseFacebook}
        />
      ) : (
        ""
      )}
      {userData ? (
        <div>
          <h3>{userData.name}</h3>
          {userData.picture && <img src={userData.picture} alt="Profile" />}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default FacebookAuth;
