import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { FaSignOutAlt } from "react-icons/fa";
import { Logo } from "../../public";

const Header = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <img src={Logo} className="w-[70px]" alt="" />
              <h1 className="text-2xl">“𝗕𝗘𝗦𝗤𝗔𝗟𝗔” 𝗔𝗣𝗧𝗘𝗞𝗔</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
