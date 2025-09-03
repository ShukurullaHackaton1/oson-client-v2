import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuppliers,
  fetchAvailableSuppliers,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
  activateSupplier,
} from "../store/slices/suppliersSlice";
import {
  FaPlus,
  FaBoxes,
  FaChartBar,
  FaTimes,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBox,
  FaIndustry,
  FaBarcode,
  FaClock,
  FaEdit,
  FaBan,
  FaPlay,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../services/api";

const Suppliers = () => {
  const dispatch = useDispatch();
  const { suppliers, availableSuppliers, isLoading } = useSelector(
    (state) => state.suppliers
  );
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showRemains, setShowRemains] = useState(null);
  const [remains, setRemains] = useState([]);
  const [remainsLoading, setRemainsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchAvailableSuppliers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createSupplier(formData)).unwrap();
      setShowModal(false);
      setFormData({ name: "", username: "", password: "" });
      toast.success("Поставщик добавлен");
    } catch (error) {
      toast.error("Ошибка добавления поставщика");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (
      !editFormData.name ||
      !editFormData.username ||
      !editFormData.password
    ) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      await dispatch(
        updateSupplier({ id: editingSupplier._id, data: editFormData })
      ).unwrap();
      setShowEditModal(false);
      setEditingSupplier(null);
      setEditFormData({ name: "", username: "", password: "" });
      toast.success("Поставщик обновлен");
    } catch (error) {
      toast.error("Ошибка обновления поставщика");
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setEditFormData({
      name: supplier.name,
      username: supplier.username,
      password: supplier.password,
    });
    setShowEditModal(true);
  };

  const handleDeactivate = async (id) => {
    if (
      window.confirm("Деактивировать поставщика? Он не сможет войти в систему.")
    ) {
      try {
        await dispatch(deactivateSupplier(id)).unwrap();
        toast.success("Поставщик деактивирован");
      } catch (error) {
        toast.error("Ошибка деактивации поставщика");
      }
    }
  };

  const handleActivate = async (id) => {
    if (window.confirm("Активировать поставщика?")) {
      try {
        await dispatch(activateSupplier(id)).unwrap();
        toast.success("Поставщик активирован");
      } catch (error) {
        toast.error("Ошибка активации поставщика");
      }
    }
  };

  const viewRemains = async (supplierName) => {
    setRemainsLoading(true);
    try {
      const response = await api.get(
        `/suppliers/${encodeURIComponent(supplierName)}/remains`
      );

      // Группировка по продуктам и филиалам
      const groupedRemains = {};
      response.data.data.forEach((item) => {
        if (!groupedRemains[item.product]) {
          groupedRemains[item.product] = {
            product: item.product,
            manufacturer: item.manufacturer,
            category: item.category,
            unit: item.unit,
            totalQuantity: 0,
            branches: {},
            series: new Set(),
            barcodes: new Set(),
            shelfLife: item.shelfLife,
          };
        }

        const productData = groupedRemains[item.product];
        productData.totalQuantity += item.quantity || 0;

        if (item.series) productData.series.add(item.series);
        if (item.barcode) productData.barcodes.add(item.barcode);

        const branchName = item.branch || "Неизвестный филиал";
        if (!productData.branches[branchName]) {
          productData.branches[branchName] = {
            quantity: 0,
            locations: new Set(),
            buyPrice: item.buyPrice,
            salePrice: item.salePrice,
          };
        }

        productData.branches[branchName].quantity += item.quantity || 0;
        if (item.location) {
          productData.branches[branchName].locations.add(item.location);
        }
      });

      setRemains(Object.values(groupedRemains));
      setShowRemains(supplierName);
    } catch (error) {
      toast.error("Ошибка загрузки остатков");
    } finally {
      setRemainsLoading(false);
    }
  };

  const addSupplierFromAvailable = (supplierName) => {
    setFormData({ ...formData, name: supplierName });
    setShowModal(true);
  };

  const getStockStatus = (quantity, unit) => {
    if (unit === "шт" || unit === "штук" || !unit) {
      if (quantity < 5)
        return {
          status: "critical",
          color: "text-red-600",
          bg: "bg-red-50",
          icon: FaExclamationTriangle,
        };
      if (quantity < 20)
        return {
          status: "low",
          color: "text-orange-600",
          bg: "bg-orange-50",
          icon: FaExclamationTriangle,
        };
      return {
        status: "good",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: FaCheckCircle,
      };
    }
    return {
      status: "normal",
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: FaBox,
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Поставщики</h1>
          <p className="text-gray-600 mt-1">
            Управление поставщиками и мониторинг остатков
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FaPlus className="mr-2" />
          Добавить поставщика
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 bg-white rounded-t-xl">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("available")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "available"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaIndustry className="inline mr-2" />
              Доступные поставщики
            </button>
            <button
              onClick={() => setActiveTab("registered")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "registered"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaCheckCircle className="inline mr-2" />
              Зарегистрированные поставщики
            </button>
          </nav>
        </div>
      </div>

      {/* Available Suppliers Tab */}
      {activeTab === "available" && (
        <div className="bg-white shadow-xl rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaIndustry className="mr-2 text-blue-600" />
              Доступные поставщики ({availableSuppliers.length})
            </h3>
          </div>
          <div className="p-6">
            {availableSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <FaIndustry className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Поставщики не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSuppliers.map((supplier, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                        <FaIndustry className="text-white text-sm" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {supplier}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => viewRemains(supplier)}
                        className="w-full flex items-center justify-center bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <FaBoxes className="mr-2" />
                        Посмотреть остатки
                      </button>
                      <button
                        onClick={() => addSupplierFromAvailable(supplier)}
                        className="w-full flex items-center justify-center bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        <FaPlus className="mr-2" />
                        Зарегистрировать
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Registered Suppliers Tab */}
      {activeTab === "registered" && (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {suppliers.length === 0 ? (
            <div className="p-12 text-center">
              <FaCheckCircle className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                Зарегистрированные поставщики не найдены
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <FaBuilding className="inline mr-2" />
                      Поставщик
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Логин
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
                  {suppliers.map((supplier, index) => (
                    <tr
                      key={supplier._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                supplier.isActive
                                  ? "bg-gradient-to-r from-orange-400 to-orange-600"
                                  : "bg-gradient-to-r from-gray-400 to-gray-600"
                              }`}
                            >
                              <FaBuilding className="text-white text-sm" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div
                              className={`text-sm font-bold ${
                                supplier.isActive
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }`}
                            >
                              {supplier.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {supplier._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            supplier.isActive
                              ? "bg-gray-100"
                              : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {supplier.username}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            supplier.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {supplier.isActive ? (
                            <>
                              <FaCheckCircle className="mr-1" />
                              Активен
                            </>
                          ) : (
                            <>
                              <FaBan className="mr-1" />
                              Деактивирован
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewRemains(supplier.name)}
                            className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                          >
                            <FaBoxes className="mr-1" />
                            Остатки
                          </button>

                          <button
                            onClick={() => handleEdit(supplier)}
                            className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors font-medium"
                          >
                            <FaEdit className="mr-1" />
                            Изменить
                          </button>

                          {supplier.isActive ? (
                            <button
                              onClick={() => handleDeactivate(supplier._id)}
                              className="flex items-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                            >
                              <FaBan className="mr-1" />
                              Деактивировать
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(supplier._id)}
                              className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors font-medium"
                            >
                              <FaPlay className="mr-1" />
                              Активировать
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Remains Modal - остается тот же */}
      {showRemains && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-6 border-0 max-w-7xl shadow-2xl rounded-2xl bg-white m-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-4">
                  <FaBuilding className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Остатки поставщика
                  </h3>
                  <p className="text-gray-600">
                    {showRemains} • Детальная информация
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRemains(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Summary Cards */}
            {remains.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <FaBox className="text-blue-600 text-2xl mr-3" />
                    <div>
                      <p className="text-blue-800 font-bold text-lg">
                        {remains.length}
                      </p>
                      <p className="text-blue-600 text-sm">
                        Уникальных товаров
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <FaBoxes className="text-green-600 text-2xl mr-3" />
                    <div>
                      <p className="text-green-800 font-bold text-lg">
                        {remains
                          .reduce((sum, item) => sum + item.totalQuantity, 0)
                          .toLocaleString()}
                      </p>
                      <p className="text-green-600 text-sm">Общий остаток</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-orange-600 text-2xl mr-3" />
                    <div>
                      <p className="text-orange-800 font-bold text-lg">
                        {
                          remains.filter((item) => {
                            const unit = item.unit;
                            if (unit === "шт" || unit === "штук" || !unit) {
                              return item.totalQuantity < 10;
                            }
                            return false;
                          }).length
                        }
                      </p>
                      <p className="text-orange-600 text-sm">Низкий остаток</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <FaBuilding className="text-purple-600 text-2xl mr-3" />
                    <div>
                      <p className="text-purple-800 font-bold text-lg">
                        {
                          [
                            ...new Set(
                              remains.flatMap((item) =>
                                Object.keys(item.branches)
                              )
                            ),
                          ].length
                        }
                      </p>
                      <p className="text-purple-600 text-sm">Филиалов</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remains Content */}
            <div className="max-h-96 overflow-y-auto">
              {remainsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">
                    Загрузка остатков...
                  </span>
                </div>
              ) : remains.length === 0 ? (
                <div className="text-center py-12">
                  <FaBoxes className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Остатки не найдены</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {remains.map((product, productIndex) => {
                    const stockStatus = getStockStatus(
                      product.totalQuantity,
                      product.unit
                    );
                    const StatusIcon = stockStatus.icon;

                    return (
                      <div
                        key={productIndex}
                        className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-start">
                              <div
                                className={`${stockStatus.bg} rounded-lg p-3 mr-4`}
                              >
                                <StatusIcon
                                  className={`${stockStatus.color} text-xl`}
                                />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                  {product.product}
                                </h4>
                                {product.manufacturer && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    🏭 {product.manufacturer}
                                  </p>
                                )}
                                {product.category && (
                                  <p className="text-xs text-blue-600">
                                    📂 {product.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`${stockStatus.color} font-bold text-xl`}
                            >
                              {product.totalQuantity.toLocaleString()}{" "}
                              {product.unit || "шт"}
                            </div>
                            <p className="text-xs text-gray-500">
                              Общий остаток
                            </p>

                            {product.shelfLife && (
                              <div className="mt-2 text-xs text-gray-600 flex items-center justify-end">
                                <FaClock className="mr-1" />
                                До:{" "}
                                {new Date(product.shelfLife).toLocaleDateString(
                                  "ru-RU"
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {[...product.series].length > 0 && (
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">
                                📋 Серии
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {[...product.series].slice(0, 3).join(", ")}
                                {[...product.series].length > 3 &&
                                  ` +${[...product.series].length - 3}`}
                              </p>
                            </div>
                          )}

                          {[...product.barcodes].length > 0 && (
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">
                                <FaBarcode className="inline mr-1" />
                                Штрихкоды
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {[...product.barcodes].slice(0, 2).join(", ")}
                              </p>
                            </div>
                          )}

                          <div className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">
                              🏢 Филиалов
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {Object.keys(product.branches).length}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-gray-600" />
                            Распределение по филиалам:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(product.branches).map(
                              ([branchName, branchData], branchIndex) => (
                                <div
                                  key={branchIndex}
                                  className="bg-white rounded-lg p-4 border border-gray-200"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="font-semibold text-gray-900 text-sm">
                                      🏢 {branchName}
                                    </h6>
                                    <span
                                      className={`font-bold text-lg ${
                                        branchData.quantity < 5
                                          ? "text-red-600"
                                          : branchData.quantity < 20
                                          ? "text-orange-600"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {branchData.quantity}{" "}
                                      {product.unit || "шт"}
                                    </span>
                                  </div>

                                  {[...branchData.locations].length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-600 mb-1">
                                        📍 Локации:
                                      </p>
                                      <p className="text-xs text-gray-800">
                                        {[...branchData.locations]
                                          .filter((loc) => loc && loc !== "-")
                                          .slice(0, 2)
                                          .join(", ")}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {remains.length > 0 &&
                    `Всего: ${remains.length} уникальных товаров`}
                </div>
                <button
                  onClick={() => setShowRemains(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-96 shadow-2xl rounded-2xl bg-white">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
                <FaBuilding className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Добавить поставщика
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2" />
                  Название компании
                </label>
                <input
                  type="text"
                  placeholder="Введите название"
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
                  👤 Логин
                </label>
                <input
                  type="text"
                  placeholder="Логин для входа"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔐 Пароль
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: "", username: "", password: "" });
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg"
                >
                  <FaPlus className="mr-2 inline" />
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-96 shadow-2xl rounded-2xl bg-white">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
                <FaEdit className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Изменить поставщика
              </h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline mr-2" />
                  Название компании
                </label>
                <input
                  type="text"
                  placeholder="Введите название"
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
                  👤 Логин
                </label>
                <input
                  type="text"
                  placeholder="Логин для входа"
                  value={editFormData.username}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔐 Пароль
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSupplier(null);
                    setEditFormData({ name: "", username: "", password: "" });
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
