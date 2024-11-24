import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';

const GenrePage = () => {
  const [selectedGenre, setSelectedGenre] = useState('rock');

  const handleSubmit = () => {
    alert(`Selected Genre: ${selectedGenre}`);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Select the Genre </CardTitle>
        </CardHeader>
        <CardContent>
        <RadioGroup defaultValue="rock">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="rock" id="rock" />
    <Label htmlFor="rock">Rock</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="pop" id="pop" />
    <Label htmlFor="pop">Pop</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="country" id="country" />
    <Label htmlFor="country">Country</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="classical" id="classical" />
    <Label htmlFor="classical">Classical</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="jazz" id="jazz" />
    <Label htmlFor="jazz">Jazz</Label>
  </div>
</RadioGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit}>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GenrePage;
