import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import CustomerCard from "./CustomerCard";
import SearchBar from "../SearchBar";
import UploadCSV from "../UploadCSV";
import Modal from "../Modal";
import {
  setCustomers,
  setLoading,
  setError,
} from "../../../slices/customerSlice";
import { fetchCustomers } from "../../../services/operations/adminServices";

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);
  const token = useSelector((state) => state.auth.token);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(["all"]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [viewMode, setViewMode] = useState("table");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;

  const loadCustomers = useCallback(async () => {
    try {
      dispatch(setLoading());
      await dispatch(fetchCustomers(token));
    } catch (err) {
      dispatch(setError(err.message || "Failed to fetch customers"));
    }
  }, [token, dispatch]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleUploadComplete = async () => {
    handleCloseModal();
    await loadCustomers();
    toast.success("Customer data updated successfully!");
  };

  // Handlers
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleFilter = (status) => {
    if (status === "all") {
      setSelectedFilters(["all"]);
    } else {
      setSelectedFilters((prevFilters) => {
        const newFilters = prevFilters.filter((f) => f !== "all");
        if (prevFilters.includes(status)) {
          return newFilters.filter((f) => f !== status);
        }
        return [...newFilters, status];
      });
    }
  };

  const handleRefresh = () => {
    loadCustomers();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Data processing
  const filteredCustomers = customers.filter((customer) => {
    const searchMatch = Object.values(customer)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const filterMatch =
      selectedFilters.includes("all") ||
      selectedFilters.includes(customer.status?.toLowerCase());

    return searchMatch && filterMatch;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = String(a[sortConfig.key]).toLowerCase();
    const bValue = String(b[sortConfig.key]).toLowerCase();

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);

  // Error UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
          <p className="mt-1 text-gray-500">
            Manage and monitor customer product demands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title="Upload CSV"
          >
            <UploadCSV onUpload={handleUploadComplete} />
          </Modal>

          <button
            onClick={() => {
              /* Add your add customer logic */
            }}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          searchQuery={searchTerm}
          setSearchQuery={handleSearch}
          placeholder="Search customers..."
          width="flex-1"
        />

        <div className="flex gap-3 relative">
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {viewMode === "table" ? "Grid View" : "Table View"}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>

          {showFilters && (
            <div className="absolute top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                {["all", "active", "away", "offline"].map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleFilter(status)}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      selectedFilters.includes(status)
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Customers List (Table/Grid View) */}
      <div className="space-y-4">
        {viewMode === "table" ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleCustomerSelect(customers.map((c) => c.id));
                          } else {
                            handleCustomerSelect([]);
                          }
                        }}
                      />
                    </th>
                    {["Customer Name", "Product Demand", "Category"].map(
                      (header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() =>
                            handleSort(header.toLowerCase().replace(" ", ""))
                          }
                        >
                          <div className="flex items-center space-x-1">
                            <span>{header}</span>
                            <ArrowUpDown
                              className={`w-4 h-4 ${
                                sortConfig.key ===
                                header.toLowerCase().replace(" ", "")
                                  ? "text-purple-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                        </th>
                      )
                    )}
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.email}
                      className={`hover:bg-gray-50 ${
                        selectedCustomers.includes(customer.id)
                          ? "bg-gray-100"
                          : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleCustomerSelect(customer.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-medium">
                              {customer.customername?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.customername}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.productdemand}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {customer.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginatedCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                isSelected={selectedCustomers.includes(customer.id)}
                onSelect={() => handleCustomerSelect(customer.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomerDashboard;