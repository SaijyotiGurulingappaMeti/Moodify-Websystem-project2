import NavigationBar from "./NavigationBar";

import PinList from "./PinList";

const Dashboard = () => {
  return (
    <div>
      <NavigationBar />
      <main className="pt-[80px]">
        <PinList />
      </main>
    </div>
  );
};

export default Dashboard;
