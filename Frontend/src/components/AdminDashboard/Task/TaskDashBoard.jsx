import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../Modal";
import TaskForm from "./TaskForm";
// here use getcustomer and get tasks services 
import {fetchRepresentatives,fetchCustomers,fetchTasks,createTask} from "../../../services/operations/adminServices"

const RepresentativeTaskDashboard = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const teamMembers = [
    { id: 1, name: "John Doe", role: "Sales Representative" },
    { id: 2, name: "Jane Smith", role: "Account Manager" },
    { id: 3, name: "Mike Johnson", role: "Sales Manager" },
  ];

  const customers = [
    {
      id: "cust_1",
      name: "manthan",
      productDemand: "samsung S24 Ultra",
      category: "Mobile",
      email: "a@gmail.com",
    },
    {
      id: "cust_2",
      name: "soham",
      productDemand: "sony bravia 4k oled",
      category: "TV",
      email: "b@gmail.com",
    },
    {
      id: "cust_3",
      name: "pragati",
      productDemand: "apple macbook pro",
      category: "Laptop",
      email: "c@gmail.com",
    },
    {
      id: "cust_4",
      name: "omkar",
      productDemand: "smart 450l double door fridge",
      category: "Refrigerator",
      email: "d@gmail.com",
    },
    {
      id: "cust_5",
      name: "raj",
      productDemand: "iphone 15 pro max",
      category: "Mobile",
      email: "e@gmail.com",
    },
    {
      id: "cust_6",
      name: "kunal",
      productDemand: "lg oled c3 55inch",
      category: "TV",
      email: "f@gmail.com",
    },
    {
      id: "cust_7",
      name: "varun",
      productDemand: "dell xps 15",
      category: "Laptop",
      email: "g@gmail.com",
    },
    {
      id: "cust_8",
      name: "sahil",
      productDemand: "whirlpool 500l side by side",
      category: "Refrigerator",
      email: "h@gmail.com",
    },
    {
      id: "cust_9",
      name: "priya",
      productDemand: "oneplus 12",
      category: "Mobile",
      email: "i@gmail.com",
    },
    {
      id: "cust_10",
      name: "amit",
      productDemand: "samsung neo qled 65inch",
      category: "TV",
      email: "j@gmail.com",
    },
    {
      id: "cust_11",
      name: "neha",
      productDemand: "hp spectre x360",
      category: "Laptop",
      email: "k@gmail.com",
    },
    {
      id: "cust_12",
      name: "rahul",
      productDemand: "samsung french door refrigerator",
      category: "Refrigerator",
      email: "l@gmail.com",
    },
    {
      id: "cust_13",
      name: "shreya",
      productDemand: "google pixel 8 pro",
      category: "Mobile",
      email: "m@gmail.com",
    },
    {
      id: "cust_14",
      name: "aditya",
      productDemand: "tcl qled 75inch",
      category: "TV",
      email: "n@gmail.com",
    },
    {
      id: "cust_15",
      name: "kavita",
      productDemand: "lenovo thinkpad x1",
      category: "Laptop",
      email: "o@gmail.com",
    },
    {
      id: "cust_16",
      name: "rohan",
      productDemand: "lg inverter refrigerator",
      category: "Refrigerator",
      email: "p@gmail.com",
    },
    {
      id: "cust_17",
      name: "anita",
      productDemand: "motorola edge 40",
      category: "Mobile",
      email: "q@gmail.com",
    },
    {
      id: "cust_18",
      name: "vijay",
      productDemand: "mi qled tv 55inch",
      category: "TV",
      email: "r@gmail.com",
    },
    {
      id: "cust_19",
      name: "deepak",
      productDemand: "asus rog gaming laptop",
      category: "Laptop",
      email: "s@gmail.com",
    },
    {
      id: "cust_20",
      name: "meera",
      productDemand: "haier side by side refrigerator",
      category: "Refrigerator",
      email: "t@gmail.com",
    },
    {
      id: "cust_21",
      name: "manthan",
      productDemand: "Tube light",
      category: "electronic gadget",
      email: "a@gmail.com",
    }
  ];
  

  const tasks = [
    {
      id: 1,
      title: "Follow up on Sales Lead",
      description: "Contact potential client from recent marketing campaign",
      status: "ACTIVE",
      priority: "High",
      assignedDate: "2024-02-15",
      dueDate: "2024-02-20",
    },
    // {
    //   id: 2,
    //   title: "Prepare Sales Presentation",
    //   description:
    //     "Create a comprehensive pitch deck for upcoming client meeting",
    //   status: "PENDING",
    //   priority: "Medium",
    //   assignedDate: "2024-02-10",
    //   dueDate: "2024-02-25",
    // },
    // {
    //   id: 3,
    //   title: "Client Meeting Follow-up",
    //   description: "Send detailed proposal after initial discussion",
    //   status: "COMPLETED",
    //   priority: "Low",
    //   assignedDate: "2024-02-05",
    //   dueDate: "2024-02-15",
    // },
  ];

  const handleTaskSubmit = (data) => {
    console.log("New task data:", data);
    // Here you would typically dispatch an action to add the task
    setIsModalOpen(false);
  };

  // Status filter handler
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filter tasks based on status
  const filteredTasks = tasks.filter(
    (task) => statusFilter === "ALL" || task.status === statusFilter
  );

  // Pagination logic
  const indexOfLastTask = currentPage * pageSize;
  const indexOfFirstTask = indexOfLastTask - pageSize;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / pageSize);

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gray-50 border-b">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Representative Task Dashboard
          </h1>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <label
                htmlFor="status-filter"
                className="text-gray-700 font-medium"
              >
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="p-2 form-select block w-full md:w-auto border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              >
                <option value="ALL">All Tasks</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 lg:py-1 text-white font-medium text-sm md:text-base lg:text-lg bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Assign New Task
            </button>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.assignedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t">
            <div className="flex-1 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* No Tasks Message */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found matching the selected filter.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign New Task"
      >
        <TaskForm
          teamMembers={teamMembers}
          customers={customers}
          onSubmit={handleTaskSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default RepresentativeTaskDashboard;
