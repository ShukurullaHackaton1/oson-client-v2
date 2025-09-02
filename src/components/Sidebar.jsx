import { Link, useLocation } from "react-router-dom";
import { FaChartBar, FaUserMd, FaTruck } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: FaChartBar, label: "Панель управления" },
    { path: "/doctors", icon: FaUserMd, label: "Врачи" },
    { path: "/suppliers", icon: FaTruck, label: "Поставщики" },
  ];

  return (
    <div className="bg-gradient-to-b relative from-blue-900 to-blue-800 w-64 min-h-screen shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">🏥 Аптека Система</h2>
        <p className="text-blue-200 text-sm mt-1">Управление данными</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-4 text-blue-100 hover:bg-blue-700 hover:text-white transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-blue-700 text-white border-r-4 border-blue-300 shadow-lg"
                  : ""
              }`}
            >
              <Icon className="mr-3 text-lg" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-blue-800 rounded-lg p-4 text-center">
          <div className="text-blue-200 text-xs">Система активна</div>
          <div className="text-white text-sm font-semibold">
            {new Date().toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
