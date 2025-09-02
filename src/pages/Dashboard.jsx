import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaBoxes,
  FaUserMd,
  FaTruck,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaClock,
  FaSync,
  FaDatabase,
  FaArrowUp,
  FaArrowDown,
  FaWifi,
  FaWifiSlash,
} from "react-icons/fa";
import api from "../services/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [backgroundStatus, setBackgroundStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  const fetchDashboardData = async () => {
    try {
      setConnectionStatus("connecting");

      // Dashboard stats so'rovi
      const statsResponse = await api.get("/dashboard/stats");
      setStats(statsResponse.data.data);

      // Background status so'rovi (optional)
      try {
        const backgroundResponse = await api.get("/background/status");
        setBackgroundStatus(backgroundResponse.data.data);
      } catch (backgroundError) {
        console.log("Background status mavjud emas:", backgroundError.message);
        setBackgroundStatus(null);
      }

      setConnectionStatus("connected");
    } catch (error) {
      console.error("Dashboard ma'lumotlari olishda xato:", error);
      setConnectionStatus("error");

      if (error.response?.status === 404) {
        toast.error("Dashboard API topilmadi. Backend ni tekshiring.");
      } else {
        toast.error("Ma'lumotlarni yuklashda xatolik");
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerManualRefresh = async () => {
    try {
      setRefreshing(true);

      // Background refresh trigger qilish
      try {
        await api.post("/background/manual-refresh");
        toast.success("Manual refresh boshlandi");
      } catch (error) {
        console.log("Background refresh mavjud emas");
      }

      // Ma'lumotlarni yangilash
      setTimeout(() => {
        fetchDashboardData();
        setRefreshing(false);
      }, 3000);
    } catch (error) {
      console.error("Manual refresh xatosi:", error);
      toast.error("Refresh da xatolik");
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Avto-yangilanish har 30 sekundda
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!stats) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <FaWifiSlash className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Ошибка подключения
          </h2>
          <p className="text-gray-600 mb-4">
            Не удается загрузить данные dashboard
          </p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const mainStats = [
    {
      title: "Всего продаж",
      value: stats.totalSales || 0,
      icon: FaChartLine,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      change: `${stats.salesChange > 0 ? "+" : ""}${stats.salesChange || 0}%`,
      changeType: (stats.salesChange || 0) >= 0 ? "up" : "down",
    },
    {
      title: "Остатки в наличии",
      value: stats.totalRemains || 0,
      icon: FaBoxes,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      change: "+2%",
      changeType: "up",
    },
    {
      title: "Активных врачей",
      value: stats.totalDoctors || 0,
      icon: FaUserMd,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      change: "+5%",
      changeType: "up",
    },
    {
      title: "Поставщиков",
      value: stats.totalSuppliers || 0,
      icon: FaTruck,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      change: `${stats.totalSuppliers > 0 ? "+" : ""}0%`,
      changeType: "up",
    },
  ];

  const todayStats = [
    {
      title: "Продажи сегодня",
      value: stats.todaySales || 0,
      subtitle: `Вчера: ${stats.yesterdaySales || 0}`,
      icon: FaChartLine,
      color: "text-blue-600",
    },
    {
      title: "Выручка сегодня",
      value: `${(stats.todayRevenue || 0).toLocaleString()} сум`,
      subtitle: `Изменение: ${stats.revenueChange > 0 ? "+" : ""}${
        stats.revenueChange || 0
      }%`,
      icon: FaMoneyBillWave,
      color: "text-green-600",
    },
    {
      title: "Критических остатков",
      value: stats.criticalStock || 0,
      subtitle: `${stats.dataQuality?.criticalStockPercentage || 0}% от общего`,
      icon: FaExclamationTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Панель управления
          </h1>
          <div className="flex items-center mt-2">
            <p className="text-gray-600">
              Обзор системы аптеки в реальном времени
            </p>
            <div
              className={`ml-4 flex items-center ${
                connectionStatus === "connected"
                  ? "text-green-600"
                  : connectionStatus === "connecting"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {connectionStatus === "connected" ? <FaWifi /> : <FaWifiSlash />}
              <span className="ml-1 text-xs">
                {connectionStatus === "connected"
                  ? "Подключено"
                  : connectionStatus === "connecting"
                  ? "Подключение..."
                  : "Нет связи"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={triggerManualRefresh}
          disabled={refreshing}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            refreshing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
          }`}
        >
          <FaSync className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Обновление..." : "Обновить данные"}
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-3">
                      {stat.changeType === "up" ? (
                        <FaArrowUp className="text-green-500 text-sm mr-1" />
                      ) : (
                        <FaArrowDown className="text-red-500 text-sm mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        с вчера
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color} rounded-xl p-4 shadow-lg`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-3">
                <Icon className={`text-2xl mr-4 ${stat.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 border-t pt-2">
                  {stat.subtitle}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* System Status and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FaDatabase className="mr-2 text-blue-600" />
            Статус системы
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FaDatabase className="text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">База данных</p>
                  <p className="text-sm text-gray-600">MongoDB подключение</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {backgroundStatus && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaSync
                    className={`mr-3 ${
                      backgroundStatus.refresh?.isRunning
                        ? "animate-spin text-green-600"
                        : "text-gray-600"
                    }`}
                  />
                  <div>
                    <p className="font-medium">Обновление данных</p>
                    <p className="text-sm text-gray-600">
                      {backgroundStatus.refresh?.currentTask || "Ожидание"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    backgroundStatus.refresh?.isRunning
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <FaChartLine className="text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Покрытие данных</p>
                  <p className="text-sm text-gray-600">
                    {stats.dataQuality?.salesCoverage || 0}% продаж с товарами
                  </p>
                </div>
              </div>
              <div className="text-green-600 font-bold">
                {stats.salesWithItems || 0}/{stats.totalSales || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FaClock className="mr-2 text-blue-600" />
            Последняя активность
          </h3>
          <div className="space-y-3">
            {stats.recentSales &&
              stats.recentSales.slice(0, 6).map((sale, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-blue-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Чек №{sale.number}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {sale.items && sale.items.length > 0
                          ? `${sale.items.length} товаров`
                          : "Товары загружаются..."}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        {(sale.soldAmount || 0).toLocaleString()} сум
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(sale.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>
              ))}

            {(!stats.recentSales || stats.recentSales.length === 0) && (
              <div className="text-center py-8">
                <FaClock className="mx-auto text-2xl text-gray-400 mb-2" />
                <p className="text-gray-500">Активность не найдена</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Быстрые действия
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={triggerManualRefresh}
            disabled={refreshing}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <FaSync
              className={`text-blue-600 text-2xl mb-2 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            <span className="text-sm font-medium text-blue-800">
              Обновить данные
            </span>
          </button>

          <button
            onClick={() => (window.location.href = "/doctors")}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FaUserMd className="text-green-600 text-2xl mb-2" />
            <span className="text-sm font-medium text-green-800">Врачи</span>
          </button>

          <button
            onClick={() => (window.location.href = "/suppliers")}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FaTruck className="text-purple-600 text-2xl mb-2" />
            <span className="text-sm font-medium text-purple-800">
              Поставщики
            </span>
          </button>

          <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <FaExclamationTriangle className="text-orange-600 text-2xl mb-2" />
            <span className="text-sm font-medium text-orange-800">
              Критич. остатки
            </span>
            {stats.criticalStock > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1">
                {stats.criticalStock}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Top Selling Products */}
      {stats.topSellingProducts && stats.topSellingProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Топ продаваемые товары
          </h3>
          <div className="space-y-3">
            {stats.topSellingProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product._id}</p>
                    <p className="text-sm text-gray-600">
                      Продано: {product.totalSold} шт
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {(product.totalRevenue || 0).toLocaleString()} сум
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
