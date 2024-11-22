import { useState } from "react";
import { Button } from "./components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LogoutButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Make a request to the server to log out
      const response = await fetch("http://localhost:4000/auth/logout", {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        // Redirect to the homepage after successful logout
        window.location.href = "http://localhost:5173/";
      } else {
        console.error("Failed to log out:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsDialogOpen(false); // Close the dialog
    }
  };

  return (
    <div>
      <Button
        onClick={openDialog}
        className="w-full bg-[#E60023] hover:bg-[#ad001b] text-white rounded-xl"
      >
        Logout
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out of Moodify!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              <div className="bg-[#E60023] hover:bg-[#ad001b] text-white p-2 rounded-xl">
                Yes, Logout
              </div>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LogoutButton;
