const { v4: uuidv4 } = require("uuid");
const vultrConfig = require("../config/vultrConfig");
require("dotenv").config();
task_bucket = process.env.TASK_BUCKET;
user_bucket = process.env.USER_BUCKET;
csv_bucket = process.env.CSV_BUCKET;

require("dotenv").config();
vultr_llama_endpoint = process.env.VULTR_LLAMA_ENDPOINT;

const axios = require("axios");

const createTask = async (req, res) => {
  const { customerName, projectTitle, description, script, keywords } =
    req.body;

  if (!customerName || !projectTitle || !description || !script) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const taskId = uuidv4();
  const taskData = {
    taskId,
    customerName,
    projectTitle,
    description,
    script,
    keywords,
  };

  const params = {
    Bucket: task_bucket,
    Key: `tasks/${taskId}.json`,
    Body: JSON.stringify(taskData),
    ContentType: "application/json",
  };

  try {
    await vultrConfig.upload(params).promise();
    res.status(201).json({ message: "Task created successfully", taskId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

const assignTask = async (req, res) => {
  const { taskId, representativeName } = req.body;

  if (!taskId || !representativeName) {
    return res
      .status(400)
      .json({ message: "Task ID and representative name are required" });
  }

  const params = {
    Bucket: task_bucket,
    Key: `tasks/${taskId}.json`,
  };

  try {
    const task = await vultrConfig.getObject(params).promise();
    const taskData = JSON.parse(task.Body.toString());

    taskData.assignedTo = representativeName;

    await vultrConfig
      .putObject({
        ...params,
        Body: JSON.stringify(taskData),
      })
      .promise();

    res
      .status(200)
      .json({
        message: "Task assigned successfully",
        taskId,
        representativeName,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign task" });
  }
};

const getRepresentatives = async (req, res) => {
  const params = {
    Bucket: user_bucket,
    Prefix: "users/",
  };

  try {
    const usersList = await vultrConfig.listObjectsV2(params).promise();

    const representatives = await Promise.all(
      usersList.Contents.map(async (file) => {
        const user = await vultrConfig
          .getObject({ Bucket: params.Bucket, Key: file.Key })
          .promise();
        const userData = JSON.parse(user.Body.toString());

        if (userData.role === "Representative") {
          return {
            name: userData.name,
            email: userData.email,
            operations: userData.operations,
          };
        }
        return null;
      })
    );

    const filteredRepresentatives = representatives.filter(
      (rep) => rep !== null
    );
    res.status(200).json(filteredRepresentatives);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch representatives" });
  }
};

const fetchTasks = async (req, res) => {
  const params = {
    Bucket: task_bucket,
    Prefix: "tasks/",
  };

  try {
    const taskList = await vultrConfig.listObjectsV2(params).promise();
    const tasks = await Promise.all(
      taskList.Contents.map(async (file) => {
        const task = await vultrConfig
          .getObject({ Bucket: params.Bucket, Key: file.Key })
          .promise();
        return JSON.parse(task.Body.toString());
      })
    );
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

const csv = require("csv-parser");
const multer = require("multer");
const stream = require("stream");

// Set up multer for file handling
const upload = multer({ storage: multer.memoryStorage() });
const uploadCSV = async (req, res) => {
  console.log("Received file:", req.file); // Add this line

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const { originalname, buffer } = req.file;

  // Prepare the upload parameters
  const params = {
    Bucket: csv_bucket,
    Key: `csv/${originalname}`,
    Body: buffer,
    ContentType: "text/csv",
  };

  try {
    // Upload the CSV file
    await vultrConfig.upload(params).promise();

    // Now, parse the CSV data
    const results = [];
    const readableStream = new stream.PassThrough();
    readableStream.end(buffer); // End the stream with the buffer data

    readableStream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log("Parsed CSV data:", results);
        res
          .status(201)
          .json({
            message: "CSV uploaded and processed successfully",
            data: results,
          });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to upload CSV" });
  }
};

const getCustomerData = async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      console.log('Error: No filename provided');
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    if (!filename.endsWith('.csv')) {
      console.log('Error: Invalid file extension');
      return res.status(400).json({
        success: false,
        message: 'File must be a CSV'
      });
    }

    try {
      const listAllParams = {
        Bucket: csv_bucket
      };
      
      const allObjects = await vultrConfig.listObjectsV2(listAllParams).promise();
      
      // Check if we can find our file
      const csvFolder = allObjects.Contents.filter(obj => obj.Key.startsWith('csv/'));
      
      // Look for the exact file
      const fileKey = `csv/${filename}`;
      const exactFile = allObjects.Contents.find(obj => obj.Key.toLowerCase() === fileKey.toLowerCase());
      
      if (exactFile) {
        // Use the exact key from the bucket (preserves case)
        const params = {
          Bucket: csv_bucket,
          Key: exactFile.Key
        };

        const csvFile = await vultrConfig.getObject(params).promise();
        
        if (!csvFile.Body) {
          throw new Error('File body is empty');
        }

        const csvData = [];

        // Create readable stream from buffer
        const readable = stream.Readable.from(csvFile.Body);

        return new Promise((resolve, reject) => {
          readable
            .pipe(csv({
              skipEmptyLines: true,
              trim: true
            }))
            .on('data', (row) => {
              csvData.push(row);
            })
            .on('end', () => {
              res.status(200).json({
                success: true,
                data: csvData
              });
              resolve();
            })
            .on('error', (error) => {
              res.status(500).json({
                success: false,
                message: 'Failed to process CSV',
                error: error.message
              });
              reject(error);
            });
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'CSV file not found',
          availableFiles: csvFolder.map(obj => obj.Key)
        });
      }
      
    } catch (listError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to list bucket contents',
        error: listError.message
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve CSV data',
      error: error.message
    });
  }
};

const generate_script = async (req, res) => {
  const { description, task } = req.body;
  console.log("Received request with description:", description);

  if (!description || !task) {
    return res
      .status(400)
      .json({ error: "Description and task are required." });
  }

  try {
    // Call Vultr Llama 3 API
    const response = await axios.post(
      "https://api.vultrinference.com/v1/chat/completions",
      {
        model: "llama2-13b-chat-Q5_K_M",
        messages: [
          {
            role: "user",
            content: task + " " + JSON.stringify(description),
          },
        ],
        max_tokens: 2048,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: vultr_llama_endpoint,
          "Content-Type": "application/json",
        },
      }
    );

    const { choices } = response.data;
    let script = choices[0].message.content;

    // Generalize processing of the script
    // Remove unwanted tokens and clean up the text
    script = script
      .replace(
        /(?:Script:|.*?What do you think\?|.*?Would you like to learn more about this TV.*?)/is,
        ""
      ) // Remove leading identifiers and trailing questions
      .replace(/\n+/g, " ") // Replace multiple newlines with a single space
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim(); // Trim leading and trailing whitespace

    // Optionally, remove any remaining special characters or emojis
    script = script.replace(/[🎬🍿💬🕹️🏠📞😊📺]*$/, "").trim();

    return res.json({ script });
  } catch (error) {
    console.error("Error calling Vultr API:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while generating the script." });
  }
};

const generate_keywords = async (req, res) => {
  const { script, task } = req.body;
  if (!script || !task) {
    return res.status(400).json({ error: "Script and task are required." });
  }
  try {
    // Call Vultr Llama 3 API
    const response = await axios.post(
      "https://api.vultrinference.com/v1/chat/completions",
      {
        model: "llama2-13b-chat-Q5_K_M",
        messages: [
          {
            role: "user",
            content: task + " " + script,
          },
        ],
        max_tokens: 2048,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: vultr_llama_endpoint,
          "Content-Type": "application/json",
        },
      }
    );

    const { choices } = response.data;
    const keywords = choices[0].message.content;

    // Initialize arrays to hold personal and product factors
    const personalFactors = [];
    const productKeywords = [];

    // Split the response into lines and categorize the keywords
    const lines = keywords.split("\n");
    let currentCategory = "";

    lines.forEach((line) => {
      line = line.trim();
      if (line.match(/Personal Factors:/i)) {
        currentCategory = "personal";
      } else if (line.match(/Product Factors:/i)) {
        currentCategory = "product";
      } else if (line) {
        if (currentCategory === "personal") {
          // Check for bullet points or numbers and clean them
          personalFactors.push(line.replace(/^\*\s*|\d+\.\s*/, "").trim());
        } else if (currentCategory === "product") {
          productKeywords.push(line.replace(/^\*\s*|\d+\.\s*/, "").trim());
        }
      }
    });

    return res.json({
      "personal Keywords": personalFactors.join(", "),
      "product keywords": productKeywords.join(", "),
    });
  } catch (error) {
    console.error("Error calling Vultr API:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while generating the keywords." });
  }
};

module.exports = {
  createTask,
  assignTask,
  getRepresentatives,
  fetchTasks,
  uploadCSV,
  getCustomerData,
  generate_script,
  generate_keywords,
};
