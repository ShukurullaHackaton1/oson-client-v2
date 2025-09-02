import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctors,
  createDoctor,
  deleteDoctor,
} from "../store/slices/doctorsSlice";
import {
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaChartLine,
  FaTrash,
  FaTimes,
  FaUser,
  FaIdCard,
  FaKey,
  FaStethoscope,
  FaPills,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaReceipt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../services/api";

const Doctors = () => {
  const dispatch = useDispatch();
  const { doctors, isLoading } = useSelector((state) => state.doctors);
  const [showModal, setShowModal] = useState(false);
  const [showSales, setShowSales] = useState(null);
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    login: "",
    password: "",
    code: "",
  });

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createDoctor(formData)).unwrap();
      setShowModal(false);
      setFormData({
        name: "",
        profession: "",
        login: "",
        password: "",
        code: "",
      });
      toast.success("Врач добавлен");
    } catch (error) {
      toast.error("Ошибка добавления врача");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить врача?")) {
      try {
        await dispatch(deleteDoctor(id)).unwrap();
        toast.success("Врач удален");
      } catch (error) {
        toast.error("Ошибка удаления");
      }
    }
  };

  const viewSales = async (doctor) => {
    setSalesLoading(true);
    try {
      const response = await api.get(`/doctors/${doctor._id}/sales`);
      setSales(response.data.data);
      setShowSales(doctor);
    } catch (error) {
      toast.error("Ошибка загрузки продаж");
    } finally {
      setSalesLoading(false);
    }
  };

  const togglePassword = (doctorId) => {
    setShowPassword((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  // Группировка продаж по чекам
  const groupSalesByCheck = (salesData) => {
    const grouped = {};
    salesData.forEach((sale) => {
      if (!grouped[sale.saleNumber]) {
        grouped[sale.saleNumber] = {
          checkNumber: sale.saleNumber,
          date: sale.saleDate,
          items: [],
          totalAmount: 0,
        };
      }
      grouped[sale.saleNumber].items.push(sale);
      grouped[sale.saleNumber].totalAmount += sale.soldAmount || 0;
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Врачи</h1>
          <p className="text-gray-600 mt-1">
            Управление врачами и отслеживание их продаж
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FaPlus className="mr-2" />
          Добавить врача
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaUser className="mr-2" />
                      Врач
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaStethoscope className="mr-2" />
                      Профессия
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaIdCard className="mr-2" />
                      Логин
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaKey className="mr-2" />
                      Пароль
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Код
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor, index) => (
                  <tr
                    key={doctor._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <FaUser className="text-white text-sm" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {doctor.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {doctor._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {doctor.profession}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {doctor.login}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="bg-gray-100 px-2 py-1 rounded mr-2 text-sm">
                          {showPassword[doctor._id]
                            ? doctor.password
                            : "••••••••"}
                        </code>
                        <button
                          onClick={() => togglePassword(doctor._id)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          {showPassword[doctor._id] ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                        {doctor.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => viewSales(doctor)}
                          className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FaChartLine className="mr-1" />
                          Продажи
                        </button>
                        <button
                          onClick={() => handleDelete(doctor._id)}
                          className="flex items-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <FaTrash className="mr-1" />
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Sales Modal */}
      {showSales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-6 border-0 max-w-6xl shadow-2xl rounded-2xl bg-white m-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Продажи врача
                  </h3>
                  <p className="text-gray-600">
                    {showSales.name} • {showSales.profession}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSales(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Sales Content */}
            <div className="max-h-96 overflow-y-auto">
              {salesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Загрузка продаж...</span>
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-12">
                  <FaChartLine className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Продажи не найдены</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupSalesByCheck(sales).map((checkGroup, checkIndex) => (
                    <div key={checkIndex} className="bg-gray-50 rounded-xl p-5">
                      {/* Check Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FaReceipt className="text-blue-600 mr-3 text-lg" />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              Чек №{checkGroup.checkNumber}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaCalendarAlt className="mr-2" />
                              {new Date(checkGroup.date).toLocaleString(
                                "ru-RU"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-green-600 font-bold text-lg">
                            <FaMoneyBillWave className="mr-2" />
                            {checkGroup.totalAmount.toLocaleString()} сум
                          </div>
                          <p className="text-xs text-gray-500">
                            {checkGroup.items.length} товаров
                          </p>
                        </div>
                      </div>

                      {/* Items in Check */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {checkGroup.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start">
                                  <FaPills className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                                  <div>
                                    <h5 className="font-semibold text-gray-900 text-sm leading-tight">
                                      {item.product}
                                    </h5>
                                    {item.manufacturer && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        🏭 {item.manufacturer}
                                      </p>
                                    )}
                                    {item.series && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        📋 Серия: {item.series}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <div className="text-sm font-bold text-gray-900">
                                  {item.quantity} шт
                                </div>
                                {item.soldAmount && (
                                  <div className="text-xs text-green-600 font-medium">
                                    {item.soldAmount.toLocaleString()} сум
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {sales.length > 0 &&
                    `Всего: ${groupSalesByCheck(sales).length} чеков`}
                </div>
                <button
                  onClick={() => setShowSales(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-96 shadow-2xl rounded-2xl bg-white">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                <FaUser className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Добавить врача
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Имя врача
                </label>
                <input
                  type="text"
                  placeholder="Введите имя"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaStethoscope className="inline mr-2" />
                  Профессия
                </label>
                <input
                  type="text"
                  placeholder="Например: Кардиолог"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaIdCard className="inline mr-2" />
                  Логин
                </label>
                <input
                  type="text"
                  placeholder="Логин для входа"
                  value={formData.login}
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaKey className="inline mr-2" />
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="Создайте пароль"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Специальный код
                </label>
                <input
                  type="text"
                  placeholder="Уникальный код врача"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="mr-2 inline" />
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
