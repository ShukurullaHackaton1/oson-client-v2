import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../store/slices/doctorsSlice";
import {
  fetchMessages,
  fetchDoctorsForMessaging,
  sendMessageToDoctors,
  fetchDoctorMessages,
} from "../store/slices/messagesSlice";
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
  FaPaperPlane,
  FaCheck,
  FaInbox,
  FaTelegramPlane,
  FaUsers,
  FaEnvelope,
  FaCheckSquare,
  FaSquare,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaBan,
  FaPlay,
  FaEraser,
  FaSearch,
  FaFilter,
  FaFileExport,
  FaChartBar,
  FaExclamationCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../services/api";
import moment from "moment";

const Doctors = () => {
  const dispatch = useDispatch();
  const { doctors, isLoading } = useSelector((state) => state.doctors);
  const {
    messages,
    doctorsForMessaging,
    doctorMessages,
    isLoading: messagesLoading,
    isSending,
  } = useSelector((state) => state.messages);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showSales, setShowSales] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMessagesHistory, setShowMessagesHistory] = useState(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatingDoctor, setActivatingDoctor] = useState(null);
  const [activationMonths, setActivationMonths] = useState(1);
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [activeTab, setActiveTab] = useState("doctors");
  const [salesStats, setSalesStats] = useState(null);

  // Фильтры для продаж
  const [salesFilter, setSalesFilter] = useState({
    dateFrom: "",
    dateTo: "",
    searchProduct: "",
    groupByProduct: false,
  });

  // Message modal state
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    login: "",
    password: "",
    code: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    profession: "",
    login: "",
    password: "",
    code: "",
  });

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === "messages") {
      dispatch(fetchMessages());
    }
  }, [activeTab, dispatch]);

  // ИСПРАВЛЕНО: Quantity ko'rsatish uchun helper funktsiya - to'g'ri hisoblash
  const formatQuantityDisplay = (item) => {
    // Sales items uchun - quantity raqam sifatida keladi
    if (typeof item.quantity === "number" && item.pieceCount) {
      const qty = item.quantity;
      const pc = item.pieceCount;

      // Упаковка сони (butun qism)
      const packages = Math.floor(qty);

      // Штук сони (qoldiq qism * pieceCount)
      const remainder = qty - packages;
      let pieces = Math.round(remainder * pc);

      // Agar pieces pieceCount dan katta yoki teng bo'lsa, normalizatsiya qilish
      if (pieces >= pc) {
        pieces = 0;
        packages += 1;
      }

      let result = "";
      if (packages > 0) result += `${packages} упак.`;
      if (pieces > 0) {
        if (result) result += " ";
        result += `${pieces} шт`;
      }

      return result || "0 шт";
    }

    // Supplier format uchun (remains) - quantities obyekt sifatida
    if (item.quantities && typeof item.quantities === "object") {
      const units = item.quantities.units || 0;
      const pieces = item.quantities.pieces || 0;

      let result = "";
      if (units > 0) result += `${units} упак.`;
      if (pieces > 0) {
        if (result) result += " ";
        result += `${pieces} шт`;
      }

      return result || "0 шт";
    }

    // Default
    return "0 шт";
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (
      !formData.name ||
      !formData.profession ||
      !formData.login ||
      !formData.password ||
      !formData.code
    ) {
      toast.error("Заполните все поля");
      return;
    }

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

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();

    if (
      !editFormData.name ||
      !editFormData.profession ||
      !editFormData.login ||
      !editFormData.password ||
      !editFormData.code
    ) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      await dispatch(
        updateDoctor({ id: editingDoctor._id, data: editFormData })
      ).unwrap();
      setShowEditModal(false);
      setEditingDoctor(null);
      setEditFormData({
        name: "",
        profession: "",
        login: "",
        password: "",
        code: "",
      });
      toast.success("Врач обновлен");
    } catch (error) {
      toast.error("Ошибка обновления врача");
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      name: doctor.name,
      profession: doctor.profession,
      login: doctor.login,
      password: doctor.password,
      code: doctor.code,
    });
    setShowEditModal(true);
  };

  // YANGI: Deaktivatsiya
  const handleDeactivate = async (id) => {
    if (
      window.confirm(
        "Деактивировать врача? Он не сможет войти в систему и его чат будет очищен."
      )
    ) {
      try {
        await api.put(`/doctors/${id}/deactivate`);
        await dispatch(fetchDoctors());
        toast.success("Врач деактивирован");
      } catch (error) {
        toast.error("Ошибка деактивации");
      }
    }
  };

  // YANGI: Aktivatsiya modal ochish
  const handleActivate = (doctor) => {
    setActivatingDoctor(doctor);
    setShowActivationModal(true);
  };

  // YANGI: Aktivatsiya tasdiqlash
  const confirmActivation = async () => {
    try {
      await api.put(`/doctors/${activatingDoctor._id}/activate`, {
        months: activationMonths,
      });

      await dispatch(fetchDoctors());
      setShowActivationModal(false);
      setActivatingDoctor(null);
      setActivationMonths(1);

      toast.success(
        activationMonths > 0
          ? `Врач активирован на ${activationMonths} месяцев`
          : "Врач активирован"
      );
    } catch (error) {
      toast.error("Ошибка активации");
    }
  };

  // YANGI: Doktor chatini tozalash
  const clearDoctorChat = async (doctorId) => {
    if (window.confirm("Очистить чат этого врача в телеграм боте?")) {
      try {
        await api.delete(`/doctors/${doctorId}/clear-chat`);
        toast.success("Чат врача очищен");
      } catch (error) {
        toast.error("Ошибка очистки чата");
      }
    }
  };

  // YANGI: Barcha doktor chatlarini tozalash
  const clearAllDoctorChats = async () => {
    if (
      window.confirm(
        "Очистить ВСЕ чаты врачей в телеграм боте? Это действие необратимо!"
      )
    ) {
      try {
        const response = await api.post("/doctors/clear-all-chats");
        toast.success(response.data.message);
      } catch (error) {
        toast.error("Ошибка очистки чатов");
      }
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

  // YANGI: Filter bilan sales olish
  const viewSales = async (doctor) => {
    setSalesLoading(true);
    setShowSales(doctor);
    setSalesStats(null);

    try {
      // Filterlarga qarab so'rov yuborish
      const params = new URLSearchParams();
      if (salesFilter.dateFrom) params.append("dateFrom", salesFilter.dateFrom);
      if (salesFilter.dateTo) params.append("dateTo", salesFilter.dateTo);
      if (salesFilter.searchProduct)
        params.append("searchProduct", salesFilter.searchProduct);
      if (salesFilter.groupByProduct) params.append("groupByProduct", "true");

      const response = await api.get(`/doctors/${doctor._id}/sales?${params}`);

      if (response.data.data.grouped) {
        // Gruppalangan ma'lumotlar
        setSalesStats(response.data.data);
        setSales([]);
      } else {
        // Oddiy ro'yxat
        setSales(response.data.data);

        // Statistika olish
        if (
          salesFilter.dateFrom ||
          salesFilter.dateTo ||
          salesFilter.searchProduct
        ) {
          const statsResponse = await api.get(
            `/doctors/${doctor._id}/sales-stats?${params}`
          );
          setSalesStats(statsResponse.data.data);
        }
      }
    } catch (error) {
      toast.error("Ошибка загрузки продаж");
    } finally {
      setSalesLoading(false);
    }
  };

  // YANGI: Export qilish
  const exportSalesReport = async () => {
    if (!showSales) return;

    try {
      const params = new URLSearchParams();
      if (salesFilter.dateFrom) params.append("dateFrom", salesFilter.dateFrom);
      if (salesFilter.dateTo) params.append("dateTo", salesFilter.dateTo);
      if (salesFilter.searchProduct)
        params.append("searchProduct", salesFilter.searchProduct);
      params.append("format", "csv");

      const response = await api.get(
        `/doctors/${showSales._id}/export-sales?${params}`
      );

      // CSV faylni yuklab olish
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales_${showSales.name}_${new Date().toISOString()}.csv`;
      a.click();

      toast.success("Отчет экспортирован");
    } catch (error) {
      toast.error("Ошибка экспорта");
    }
  };

  const togglePassword = (doctorId) => {
    setShowPassword((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  // YANGI: Aktivatsiya statusini aniqlash
  const getActivationStatus = (doctor) => {
    if (!doctor.isActive)
      return {
        status: "inactive",
        text: "Неактивен",
        color: "text-red-600",
        bg: "bg-red-100",
      };

    if (!doctor.activeUntil)
      return {
        status: "active",
        text: "Активен",
        color: "text-green-600",
        bg: "bg-green-100",
      };

    const now = new Date();
    const activeUntil = new Date(doctor.activeUntil);
    const daysLeft = Math.ceil((activeUntil - now) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0)
      return {
        status: "expired",
        text: "Истек",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    if (daysLeft <= 7)
      return {
        status: "expiring",
        text: `${daysLeft} дн.`,
        color: "text-orange-600",
        bg: "bg-orange-100",
      };

    return {
      status: "active",
      text: `${daysLeft} дн.`,
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  // Message functions
  const openMessageModal = async () => {
    try {
      await dispatch(fetchDoctorsForMessaging());
      setShowMessageModal(true);
    } catch (error) {
      toast.error("Ошибка загрузки списка врачей");
    }
  };

  const toggleDoctorSelection = (doctorId) => {
    setSelectedDoctors((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(doctorsForMessaging.map((doctor) => doctor._id));
    }
    setSelectAll(!selectAll);
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error("Введите текст сообщения");
      return;
    }

    if (selectedDoctors.length === 0) {
      toast.error("Выберите хотя бы одного врача");
      return;
    }

    try {
      const result = await dispatch(
        sendMessageToDoctors({
          content: messageContent,
          doctorIds: selectedDoctors,
        })
      ).unwrap();

      toast.success(result.message);
      setShowMessageModal(false);
      setMessageContent("");
      setSelectedDoctors([]);
      setSelectAll(false);

      if (activeTab === "messages") {
        dispatch(fetchMessages());
      }
    } catch (error) {
      toast.error("Ошибка отправки сообщения");
    }
  };

  const viewMessagesHistory = async (doctor) => {
    try {
      await dispatch(fetchDoctorMessages(doctor._id));
      setShowMessagesHistory(doctor);
    } catch (error) {
      toast.error("Ошибка загрузки истории сообщений");
    }
  };

  // ИСПРАВЛЕНО: Группировка продаж по чекам с правильным quantity
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
        <div className="flex space-x-3">
          <button
            onClick={clearAllDoctorChats}
            className="flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-all"
          >
            <FaEraser className="mr-2" />
            Очистить все чаты
          </button>
          <button
            onClick={openMessageModal}
            className="flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPaperPlane className="mr-2" />
            Отправить сообщение
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="mr-2" />
            Добавить врача
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 bg-white rounded-t-xl">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "doctors"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaUsers className="inline mr-2" />
              Список врачей
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "messages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaInbox className="inline mr-2" />
              История сообщений
            </button>
          </nav>
        </div>
      </div>

      {/* Doctors Tab */}
      {activeTab === "doctors" && (
        <>
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
                        Статус
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.map((doctor, index) => {
                      const activationStatus = getActivationStatus(doctor);
                      return (
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activationStatus.bg} ${activationStatus.color}`}
                              >
                                {activationStatus.text}
                              </span>
                              {doctor.activeUntil && (
                                <FaClock
                                  className="ml-2 text-gray-400"
                                  title={`До: ${new Date(
                                    doctor.activeUntil
                                  ).toLocaleDateString("ru-RU")}`}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => viewSales(doctor)}
                                className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors text-sm"
                              >
                                <FaChartLine className="mr-1" />
                                Продажи
                              </button>

                              <button
                                onClick={() => handleEdit(doctor)}
                                className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors text-sm"
                              >
                                <FaEdit className="mr-1" />
                                Изменить
                              </button>

                              {doctor.isActive ? (
                                <button
                                  onClick={() => handleDeactivate(doctor._id)}
                                  className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors text-sm"
                                >
                                  <FaBan className="mr-1" />
                                  Деактивировать
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(doctor)}
                                  className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors text-sm"
                                >
                                  <FaPlay className="mr-1" />
                                  Активировать
                                </button>
                              )}

                              <button
                                onClick={() => clearDoctorChat(doctor._id)}
                                className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors text-sm"
                              >
                                <FaEraser />
                              </button>

                              <button
                                onClick={() => handleDelete(doctor._id)}
                                className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors text-sm"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaInbox className="mr-2 text-green-600" />
              История отправленных сообщений
            </h3>
          </div>

          <div className="p-6">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Загрузка сообщений...
                </span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <FaInbox className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Сообщения не найдены</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaEnvelope className="text-blue-600 mr-2" />
                          <span className="text-sm text-gray-600">
                            {new Date(message.createdAt).toLocaleString(
                              "ru-RU"
                            )}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium bg-white rounded-lg p-3 border">
                          {message.content}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="flex items-center text-green-600 mb-1">
                          <FaCheckCircle className="mr-1" />
                          <span className="font-bold">
                            {message.deliveredCount || 0}/
                            {message.totalRecipients || 0}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">доставлено</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        <FaUsers className="inline mr-1" />
                        Получатели:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.sentTo &&
                          message.sentTo.map((recipient, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                recipient.delivered
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {recipient.delivered ? (
                                <FaCheckCircle className="mr-1" />
                              ) : (
                                <FaClock className="mr-1" />
                              )}
                              {recipient.doctorName}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ИСПРАВЛЕНО: Sales Modal with Filters - to'g'ri quantity ko'rsatish bilan */}
      {showSales && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-6 border-0 max-w-6xl shadow-2xl rounded-2xl bg-white m-4">
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
                onClick={() => {
                  setShowSales(null);
                  setSalesStats(null);
                  setSalesFilter({
                    dateFrom: "",
                    dateTo: "",
                    searchProduct: "",
                    groupByProduct: false,
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" />
                    Дата от
                  </label>
                  <input
                    type="date"
                    value={salesFilter.dateFrom}
                    onChange={(e) =>
                      setSalesFilter({
                        ...salesFilter,
                        dateFrom: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" />
                    Дата до
                  </label>
                  <input
                    type="date"
                    value={salesFilter.dateTo}
                    onChange={(e) =>
                      setSalesFilter({ ...salesFilter, dateTo: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaSearch className="inline mr-1" />
                    Поиск по продукту
                  </label>
                  <input
                    type="text"
                    placeholder="Название продукта..."
                    value={salesFilter.searchProduct}
                    onChange={(e) =>
                      setSalesFilter({
                        ...salesFilter,
                        searchProduct: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={() =>
                      setSalesFilter({
                        ...salesFilter,
                        groupByProduct: !salesFilter.groupByProduct,
                      })
                    }
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      salesFilter.groupByProduct
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FaFilter className="mr-2" />
                    Группировать
                  </button>
                </div>
              </div>

              <button
                onClick={() => viewSales(showSales)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Применить фильтры
              </button>
            </div>

            {/* Stats Summary */}
            {salesStats && salesStats.grouped && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Период</p>
                    <p className="text-lg font-bold text-gray-900">
                      {salesStats.dateRange.from} - {salesStats.dateRange.to}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Всего чеков</p>
                    <p className="text-xl font-bold text-blue-600">
                      {salesStats.totalChecks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Общая сумма</p>
                    <p className="text-xl font-bold text-green-600">
                      {(salesStats.totalAmount || 0).toLocaleString()} сум
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Всего продуктов</p>
                    <p className="text-xl font-bold text-purple-600">
                      {salesStats.totalQuantity}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sales Table/List */}
            <div className="max-h-96 overflow-y-auto">
              {salesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Загрузка продаж...</span>
                </div>
              ) : salesStats && salesStats.grouped ? (
                // Grouped display
                <div className="space-y-2">
                  {salesStats.products.map((product, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-gray-900">
                            {product.product}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Количество: {product.totalQuantity} шт
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">
                            {(product.totalAmount || 0).toLocaleString()} сум
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.sales.length} продаж
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-12">
                  <FaChartLine className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Продажи не найдены</p>
                </div>
              ) : (
                // ИСПРАВЛЕНО: Regular display with to'g'ri quantity
                <div className="space-y-4">
                  {groupSalesByCheck(sales).map((checkGroup, checkIndex) => (
                    <div key={checkIndex} className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FaReceipt className="text-blue-600 mr-3 text-lg" />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              Чек №{checkGroup.checkNumber}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaCalendarAlt className="mr-2" />
                              {moment(checkGroup.date).format("DD.MM.YYYY")}
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
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                {/* ИСПРАВЛЕНО: To'g'ri quantity formatlashtirish */}
                                <div className="text-sm font-bold text-gray-900">
                                  {formatQuantityDisplay(item)}
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
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-96 shadow-2xl rounded-2xl bg-white">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
                <FaEdit className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Изменить врача
              </h3>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Имя врача
                  </label>
                  <input
                    type="text"
                    placeholder="Введите имя"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    value={editFormData.profession}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        profession: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    value={editFormData.login}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        login: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    placeholder="Введите пароль"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    value={editFormData.code}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, code: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDoctor(null);
                      setEditFormData({
                        name: "",
                        profession: "",
                        login: "",
                        password: "",
                        code: "",
                      });
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                  >
                    <FaEdit className="mr-2 inline" />
                    Сохранить
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-96 shadow-2xl rounded-2xl bg-white">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
                <FaPlay className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Активировать врача
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                <strong>Врач:</strong> {activatingDoctor?.name}
              </p>
              <p className="text-gray-600 text-sm">
                {activatingDoctor?.profession}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Период активации (месяцев)
              </label>
              <select
                value={activationMonths}
                onChange={(e) => setActivationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={0}>Без ограничения</option>
                <option value={1}>1 месяц</option>
                <option value={2}>2 месяца</option>
                <option value={3}>3 месяца</option>
                <option value={6}>6 месяцев</option>
                <option value={12}>12 месяцев</option>
              </select>
            </div>

            {activationMonths > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <FaExclamationCircle className="inline mr-2" />
                  Аккаунт будет активен до:{" "}
                  <strong>
                    {new Date(
                      Date.now() + activationMonths * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("ru-RU")}
                  </strong>
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowActivationModal(false);
                  setActivatingDoctor(null);
                  setActivationMonths(1);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmActivation}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Активировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-6 border-0 max-w-4xl shadow-2xl rounded-2xl bg-white m-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-4">
                  <FaPaperPlane className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Отправить сообщение врачам
                  </h3>
                  <p className="text-gray-600">
                    Выберите получателей и введите текст
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedDoctors([]);
                  setSelectAll(false);
                  setMessageContent("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUsers className="mr-2 text-blue-600" />
                  Выберите получателей
                </h4>
                <div className="flex items-center">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectAll ? (
                      <FaCheckSquare className="mr-1" />
                    ) : (
                      <FaSquare className="mr-1" />
                    )}
                    Выбрать всех ({doctorsForMessaging.length})
                  </button>
                </div>
              </div>

              {doctorsForMessaging.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto text-3xl text-gray-400 mb-3" />
                  <p className="text-gray-500">Врачи не найдены</p>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                      selectedDoctors.includes(doctor._id)
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-white border-2 border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => toggleDoctorSelection(doctor._id)}
                  >
                    <div className="flex items-center flex-1">
                      <div
                        className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                          selectedDoctors.includes(doctor._id)
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedDoctors.includes(doctor._id) && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex items-center flex-1">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                          <FaUser className="text-white text-xs" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {doctor.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doctor.profession}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        {doctor.hasTelegram ? (
                          <FaTelegramPlane
                            className="text-green-600"
                            title="Telegram подключен"
                          />
                        ) : (
                          <FaTelegramPlane
                            className="text-gray-400"
                            title="Telegram не подключен"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {selectedDoctors.length > 0 && (
                <div className="mt-3 text-sm text-blue-600 font-medium">
                  Выбрано: {selectedDoctors.length} врачей
                </div>
              )}
            </div>

            {selectedDoctors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaEnvelope className="mr-2 text-green-600" />
                  Текст сообщения
                </h4>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Введите текст сообщения для врачей..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <div className="mt-2 text-right text-xs text-gray-500">
                  {messageContent.length}/1000 символов
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedDoctors([]);
                  setSelectAll(false);
                  setMessageContent("");
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={sendMessage}
                disabled={
                  isSending ||
                  selectedDoctors.length === 0 ||
                  !messageContent.trim()
                }
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Отправка...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2 inline" />
                    Отправить ({selectedDoctors.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages History Modal */}
      {showMessagesHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-6 border-0 max-w-4xl shadow-2xl rounded-2xl bg-white m-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-4">
                  <FaInbox className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    История сообщений
                  </h3>
                  <p className="text-gray-600">
                    {showMessagesHistory.name} •{" "}
                    {showMessagesHistory.profession}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMessagesHistory(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">
                    Загрузка сообщений...
                  </span>
                </div>
              ) : doctorMessages.length === 0 ? (
                <div className="text-center py-12">
                  <FaInbox className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Сообщения не найдены</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctorMessages.map((message) => (
                    <div
                      key={message._id}
                      className="bg-gray-50 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaEnvelope className="mr-2" />
                          <span>
                            {new Date(message.createdAt).toLocaleString(
                              "ru-RU"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {message.deliveryInfo?.delivered ? (
                            <div className="flex items-center text-green-600">
                              <FaCheckCircle className="mr-1" />
                              <span className="text-xs">Доставлено</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <FaClock className="mr-1" />
                              <span className="text-xs">Не доставлено</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowMessagesHistory(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
