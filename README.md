Moodify is a web application that offers personalized song recommendations by analyzing the emotional content of users' Pinterest activity.We are using the ERN (Express, React, NodeJS) stack to build the SPA. We are using Tailwind CSS and ShadCN for the Styling.The app will be deployed using Google Cloud Run for a seamless, serverless deployment.We chose Firestore database for its real-time capabilities and ease of integration with Google Cloud services.

Installation:
1. Clone the repository.
2. cd into client folder.
3. Run "npm install".
4. Run "npm run dev",this runs the application on localhost:5713(Vite).
5. cd into backend folder.
6. Run "npm install".
7. Run "npm start", this runs the backedn on localhost:4000.
8. Define the environment variables.
9. Download Service accounts json file from Firestore, and store it in config folder in backend.
10. Rename Service accounts json to "creds.json".

Now you are ready to use the Moodify application in your localhost!
