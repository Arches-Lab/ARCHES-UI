import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-4 flex-1 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
