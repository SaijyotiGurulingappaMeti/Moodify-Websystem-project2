import React from "react";
// import FacebookLogin from "react-facebook-login";
// import { FacebookLoginButton } from "react-social-login-buttons";
import { LoginSocialFacebook } from "reactjs-social-login";
import MyFacebookLoginButton from "./MyFacebookLoginButton";
function FacebookAuth() {
  //   const responseFacebook = (response) => {
  //     if (response.accessToken) {
  //       onLogin(response.accessToken);
  //     }
  //   };

  return (
    <LoginSocialFacebook
      appId="1003774381513068"
      onresolve={(response) => {
        console.log(response);
      }}
      onReject={(error) => {
        console.log(error);
      }}
    >
      <MyFacebookLoginButton />
    </LoginSocialFacebook>
  );
}

export default FacebookAuth;
