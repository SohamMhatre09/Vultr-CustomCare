// services/adminServices.js
import axios from "axios";
import { toast } from "react-hot-toast";
import { endpoints } from "../api";
import { setCustomers } from "../../slices/customerSlice";
export const BASE_URL =
  typeof import.meta.env !== "undefined" && import.meta.env.VITE_BASE_URL
    ? import.meta.env.VITE_BASE_URL
    : "http://localhost:3000";

const {
  CREATE_TASK_API,
  ASSIGN_TASK_API,
  GET_ADMIN_TASKS_API,
  GET_REPRESENTATIVES_API,
  GET_CUSTOMERS_API,
  UPLOAD_CSV_API,
} = endpoints;

// Service to create a new task
export const createTask = async (taskData) => {
  const toastId = toast.loading("Creating task...");
  try {
    const response = await axios.post(CREATE_TASK_API, taskData);
    toast.success("Task created successfully!", { id: toastId });
    console.log("Task created:", response.data);
    return response.data; // Return the created task data
  } catch (error) {
    toast.error("Error creating task", { id: toastId });
    console.error("Error creating task:", error);
    throw error; // Rethrow the error for further handling
  }
};

// Service to fetch all tasks
export const fetchTasks = async () => {
  const toastId = toast.loading("Fetching tasks...");
  try {
    const response = await axios.get(GET_ADMIN_TASKS_API);
    toast.success("Tasks fetched successfully!", { id: toastId });
    console.log("Tasks fetched:", response.data);
    return response.data; // Return the list of tasks
  } catch (error) {
    toast.error("Error fetching tasks", { id: toastId });
    console.error("Error fetching tasks:", error);
    throw error; // Rethrow the error for further handling
  }
};

// Service to fetch all representatives
export const fetchRepresentatives = async (token) => {
  const toastId = toast.loading("Fetching representatives...");
  try {
    // Send the request with the Authorization token
    const response = await axios.get(GET_REPRESENTATIVES_API, {
      headers: {
        Authorization: `Bearer ${token}`, // Add the Bearer token to the headers
      },
    });

    // Success: Show toast notification and return the data
    toast.success("Representatives fetched successfully!", { id: toastId });
    console.log("Representatives fetched:", response.data);
    return response.data; // Return the fetched representatives data
  } catch (error) {
    // Handle errors: Show toast notification and log error
    toast.error("Error fetching representatives", { id: toastId });
    console.error("Error fetching representatives:", error);
    throw error; // Rethrow the error to be handled by the calling component
  }
};
// Service to fetch customers
export const fetchCustomers = (token) => async (dispatch) => {
  const toastId = toast.loading("Fetching customers...");

  try {
    const response = await axios.get(
      `${GET_CUSTOMERS_API}?filename=customers.csv`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(setCustomers(response.data.data)); // Dispatch customers data

    toast.success("Customers fetched successfully!", { id: toastId });
    return response; // Return response if you need it elsewhere
  } catch (error) {
    toast.error("Error fetching customers", { id: toastId });
    console.error("Error fetching customers:", error);
    throw error; // Re-throw error so it can be caught in the component
  }
};

// Service to upload a CSV file
export const uploadCSV = async (csvFile, token, onProgress) => {
  const formData = new FormData();
  formData.append("file", csvFile);

  const toastId = toast.loading("Uploading CSV...");
  try {
    const response = await axios.post(UPLOAD_CSV_API, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: onProgress, // Add progress tracking here
    });

    toast.success("CSV uploaded successfully!", { id: toastId });
    console.log("CSV uploaded:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading CSV:", error);
    toast.error(error?.response?.data?.message || "Error uploading CSV", {
      id: toastId,
    });
    throw error;
  }
};

export const fetchStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalTasks: 245,
        completedTasks: 182,
        pendingTasks: 63,
        teamMembers: 12,
      });
    }, 500); // Simulating a delay
  });
};

export const fetchRecentActivity = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          action: "New task assigned",
          project: "Website Redesign",
          time: "2 hours ago",
          status: "pending",
        },
        {
          id: 2,
          action: "Task completed",
          project: "Mobile App Update",
          time: "4 hours ago",
          status: "completed",
        },
        {
          id: 3,
          action: "New team member added",
          project: "API Integration",
          time: "6 hours ago",
          status: "in-progress",
        },
        {
          id: 4,
          action: "New task assigned",
          project: "Website Redesign",
          time: "2 hours ago",
          status: "pending",
        },
        {
          id: 5,
          action: "New task assigned",
          project: "Website Redesign",
          time: "2 hours ago",
          status: "pending",
        },
        {
          id: 6,
          action: "New task assigned",
          project: "Website Redesign",
          time: "2 hours ago",
          status: "pending",
        },
        {
          id: 7,
          action: "New task assigned",
          project: "Website Redesign",
          time: "2 hours ago",
          status: "pending",
        },
        {
          id: 8,
          action: "New task assigned",
          project: "Website Redesign",
          time: "2 hours ago",
          status: "pending",
        },
      ]);
    }, 500);
  });
};

export const fetchDeadlines = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          title: "Website Launch",
          due: "Due in 2 days",
        },
        {
          title: "Team Meeting",
          due: "Tomorrow at 10:00 AM",
        },
        {
          title: "Project Review",
          due: "Next week",
        },
        {
          title: "Website Launch",
          due: "Due in 2 days",
        },
        {
          title: "Team Meeting",
          due: "Tomorrow at 10:00 AM",
        },
        {
          title: "Project Review",
          due: "Next week",
        },
      ]);
    }, 500);
  });
};

export const generateScript = async (description, task, token) => {
  console.log("Generating script with:", { description, task });

  try {
    // Simulating the API call (commented out actual API call for this example)
    // const response = await axios.post(
    //   `http://localhost:3000/api/admin/generate-script`,
    //   {
    //     description,
    //     task,
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //       'Authorization': `Bearer ${token}`
    //     },
    //   }
    // );

    const response = {
      data: {
        script: `
          "Welcome to the Smart Home Assistant. This is your go-to device for controlling home appliances using voice commands. 
          With compatibility for Alexa, Google Home, and Apple HomeKit, it seamlessly integrates into your smart home system. 
          Imagine walking into your home, and with a simple voice command, the lights turn on, the thermostat adjusts to your preferred temperature, 
          and your favorite playlist starts playing. Plus, the Smart Home Assistant learns from your habits to optimize energy usage and ensure maximum comfort."
        `,
      },
    };

    if (response.data && response.data.script) {
      console.log("Script generated successfully.");
      return response.data.script;
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Script generation error:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(
        error.response.data?.error || `Server error: ${error.response.status}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response received from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || "Failed to generate script");
    }
  }
};

export const generateKeywords = async (script, task) => {
  try {
    // Simulating the API call (commented out actual API call for this example)
    // const response = await axios.post(`${BASE_URL}/generate-keywords`, {
    //   script,
    //   task,
    // });

    const response = {
      data: {
        "personal Keywords":
          "smart home, automation, voice control, smart assistant",
        "product keywords":
          "Alexa, Google Home, Apple HomeKit, energy saving, thermostat",
      },
    };

    // Split the keywords from the response
    return {
      personalKeywords: response.data["personal Keywords"].split(", "),
      productKeywords: response.data["product keywords"].split(", "),
    };
  } catch (error) {
    console.error("Keyword generation error:", error);
    throw new Error(
      error.response?.data?.error || "Failed to generate keywords"
    );
  }
};
