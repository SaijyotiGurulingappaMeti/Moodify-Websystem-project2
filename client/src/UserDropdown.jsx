import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./components/ui/button";
import { FaCircleChevronDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { MdHistory } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { MdOutlinePermIdentity } from "react-icons/md";

const UserDropdown = ({ name }) => {
  const navigate = useNavigate(); // Get the navigate function

  const handleHistoryClick = () => {
    navigate("/history"); // Navigate to the History page
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className="rounded-xl">
          <FaCircleChevronDown color="red" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white text-gray-900  rounded-xl">
        <DropdownMenuItem>
          <MdOutlinePermIdentity />
          {name}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem onClick={handleHistoryClick}>
          <MdHistory /> History
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem onClick={handleDashboardClick}>
          <FaHome />
          Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
