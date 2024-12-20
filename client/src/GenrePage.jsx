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
import { useNavigate } from "react-router-dom";
import NavigationBar from "./NavigationBar";
import Loader from "./Loader";

const GenrePage = () => {
  const [selectedGenre, setSelectedGenre] = useState("rock");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const pinId = urlParams.get("pinId");
  const userId = urlParams.get("userId");
  const username = urlParams.get("username");
  const imageUrl = urlParams.get("imageUrl");
  const emotion = urlParams.get("emotion");

  const handleSubmit = (genre) => {
    setIsLoading(true);
    fetch("http://localhost:4000/auth/musicAttribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pinId,
        userId,
        username,
        imageUrl,
        emotion,
        genre,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setIsLoading(false);
        navigate(`/results?pinId=${pinId}&userId=${userId}`);
      })
      .catch((error) => console.error("Error:", error));
  };

  const genres = ["rock", "pop", "country", "classical", "jazz"];

  return (
    <>
      <NavigationBar />
      <div className="flex justify-center items-center h-screen font-geist">
        {isLoading ? (
          <>
            <Loader />
          </>
        ) : (
          <Card className="w-96 bg-white text-gray-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Select the Genre
              </CardTitle>
              <p className="text-sm text-gray-600">
                Emotion detected:{" "}
                <span className="font-semibold">{emotion}</span>
              </p>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedGenre}
                onValueChange={setSelectedGenre}
              >
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
                onClick={() => handleSubmit(selectedGenre)}
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
              >
                Submit
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
};

export default GenrePage;
