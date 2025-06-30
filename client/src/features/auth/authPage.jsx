import { useState } from "react";
import SigninCard from "./loginForm";
import SignupCard from "./signupForm";

const AuthPage = () => {
  const [signinForm, setSigninForm] = useState(true);

  const toggleSigninForm = () => {
    setSigninForm(!signinForm);
  };

  return (
    <>
      {signinForm ? (
        <SigninCard toggleSigninForm={toggleSigninForm} />
      ) : (
        <SignupCard toggleSigninForm={toggleSigninForm} />
      )}
    </>
  );
};

export default AuthPage;
