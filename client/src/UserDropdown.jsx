import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./components/ui/button";
import { FaCircleChevronDown } from "react-icons/fa6";
const UserDropdown = ({ name }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className="rounded-xl">
          <FaCircleChevronDown color="red" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white text-gray-900 rounded-xl">
        <DropdownMenuItem>{name}</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem>History</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
