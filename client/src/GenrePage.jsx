import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";

const GenrePage = () => {
  const [selectedGenre, setSelectedGenre] = useState("rock");

  const handleSubmit = () => {
    alert(`Selected Genre: ${selectedGenre}`);
  };

  const genres = ["rock", "pop", "country", "classical", "jazz"];

  return (
    <div className="flex justify-center items-center h-screen font-geist">
      <Card className="w-96 bg-white text-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Select the Genre</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedGenre} onValueChange={setSelectedGenre}>
            {genres.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <RadioGroupItem value={genre} id={genre} />
                <Label htmlFor={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenrePage;
