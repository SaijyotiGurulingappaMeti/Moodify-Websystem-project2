import React from "react";
import FacebookLogin from "react-facebook-login";
// import { FacebookLoginButton } from "react-social-login-buttons";
// import { LoginSocialFacebook } from "reactjs-social-login";
// import MyFacebookLoginButton from "./MyFacebookLoginButton";
function FacebookAuth() {
  const responseFacebook = (response) => {
    console.log(response);
  };

  return (
    <FacebookLogin
      appId="1003774381513068"
      autoLoad={true}
      fields="id,name,photos"
      icon="fa-facebook"
      callback={responseFacebook}
    />
  );
}

export default FacebookAuth;
