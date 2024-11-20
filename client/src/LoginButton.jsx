import { Button } from "./components/ui/button";
import { TfiPinterestAlt } from "react-icons/tfi";

const LoginButton = () => {
  const handleLoginClick = () => {
    window.location.href = "http://localhost:4000/auth/login";
  };
  return (
    <div>
      <Button
        onClick={handleLoginClick}
        className="w-full bg-[#E60023] hover:bg-[#ad001b] text-white rounded-xl font-lacquer text-xl"
      >
        <TfiPinterestAlt /> Login with Pinterest
      </Button>
    </div>
  );
};

export default LoginButton;
