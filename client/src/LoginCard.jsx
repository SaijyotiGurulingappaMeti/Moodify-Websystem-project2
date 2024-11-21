import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import LoginButton from "./LoginButton";
import { motion } from "framer-motion";

const LoginCard = () => {
  return (
    <div className=" min-h-screen w-full bg-gray-900 flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-red-500 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-red-900 rounded-full filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="align-middle justify-center border-gray-700 z-10">
        <Card className="w-[350px] border bg-black/30 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-doto text-6xl hover:text-red-700 items-center">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                Moodify
              </motion.h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginCard;
