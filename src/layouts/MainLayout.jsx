import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;