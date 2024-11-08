import React from "react";
import {
  UserCircle,
  PencilIcon,
  Trash2,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

const Loader = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

const TaskStatusBadge = ({ status }) => {
  const statusStyles = {
    completed: "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </span>
  );
};

const DropdownMenu = ({ trigger, children, align = "left" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute z-10 mt-2 ${
            align === "right" ? "right-0" : "left-0"
          } w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

const TaskTable = ({
  tasks: initialTasks,
  onEdit,
  onCancel,
  onDelete,
  loading = false,
}) => {
  const [tasks, setTasks] = React.useState(initialTasks);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [selectedTasks, setSelectedTasks] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: "asc",
  });

  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleTaskSelect = (taskId) => {
    if (Array.isArray(taskId)) {
      setSelectedTasks(taskId);
    } else {
      setSelectedTasks((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      );
    }
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || task.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchTerm, filterStatus]);

  const sortedTasks = React.useMemo(() => {
    if (!sortConfig.key) return filteredTasks;

    return [...filteredTasks].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredTasks, sortConfig]);

  const paginatedTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);

  const pageCount = Math.ceil(sortedTasks.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-4 px-5 py-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu
          trigger={
            <button className="px-4 py-2 border border-gray-300 rounded-md inline-flex items-center gap-2 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </button>
          }
        >
          {["all", "completed", "in-progress", "pending", "cancelled"].map(
            (status) => (
              <button
                key={status}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={selectedTasks.length === paginatedTasks.length}
                      onChange={(e) => {
                        handleTaskSelect(
                          e.target.checked
                            ? paginatedTasks.map((t) => t.id)
                            : []
                        );
                      }}
                    />
                  </th>
                  {[
                    "Project Title",
                    "Description",
                    "Status",
                    "Team Members",
                  ].map((header) => (
                    <th
                      key={header}
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
                  ))}
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTasks.map((task) => (
                  <tr
                    key={task.taskId}
                    className={`hover:bg-gray-50 ${
                      selectedTasks.includes(task.id)
                        ? "bg-gray-100"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleTaskSelect(task.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {task.projectTitle?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {task.projectTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.keywords?.slice(0, 3).join(", ")}
                            {task.keywords?.length > 3 && ", ..."}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TaskStatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        {task.assignedMembers
                          ?.slice(0, 3)
                          .map((member, index) => (
                            <div
                              key={index}
                              className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white relative"
                            >
                              <span className="text-purple-600 text-xs font-medium">
                                {member.name?.charAt(0)?.toUpperCase()}
                              </span>
                              <div className="absolute -right-12 top-2 text-sm  text-gray-900 w-full text-center">
                                {member.name}
                              </div>
                            </div>
                          ))}
                        {(task.assignedMembers?.length || 0) > 3 && (
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
                            <span className="text-gray-600 text-xs font-medium">
                              +{task.assignedMembers.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu
                        align="right"
                        trigger={
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                      >
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => onEdit?.(task)}
                        >
                          <div className="flex items-center">
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </div>
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => onDelete?.(task.id)}
                        >
                          <div className="flex items-center">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </div>
                        </button>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedTasks.length)} of{" "}
            {sortedTasks.length} results
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 border border-gray-300 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className={`px-4 py-2 border border-gray-300 rounded-md ${
                currentPage === pageCount
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
