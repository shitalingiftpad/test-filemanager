document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const elements = {
    headerInput: document.getElementById('headerInput'),
    headerTitle: document.getElementById('headerTitle'),
    headerDisplay: document.getElementById('headerDisplay'),
    addHeaderBtn: document.getElementById('addHeaderBtn'),
    taskNumber: document.getElementById('taskNumber'),
    taskInput: document.getElementById('taskInput'),
    taskDescription: document.getElementById('taskDescription'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    removeTasksBtn: document.getElementById('removeTasksBtn'),
    taskList: document.getElementById('taskList'),
    msg: document.getElementById('msg')
  };

  // Load tasks and title from localStorage on page load
  loadTitle();
  loadTasks();

  // Event Listeners
  elements.addHeaderBtn.addEventListener('click', setHeaderTitle);
  elements.addTaskBtn.addEventListener('click', handleAddTask);
  elements.removeTasksBtn.addEventListener('click', removeAllTasks);

  // Set the header title, hide the input field, and save the title to localStorage
  function setHeaderTitle() {
    const header = elements.headerTitle.value.trim();
    if (header) {
      elements.headerDisplay.textContent = header;
      elements.headerDisplay.style.display = 'block';
      elements.headerInput.style.display = 'none';
      saveTitle(header);
    }
  }

  // Handle adding a new task or issue
  function handleAddTask() {
    const fileName = elements.taskInput ? elements.taskInput.value.trim() : '';
    const number = elements.taskNumber ? elements.taskNumber.value.trim() : '';
    const description = elements.taskDescription ? elements.taskDescription.value.trim() : '';

    if (!fileName && !number) {
      displayMessage("Task/Issue number or File name cannot be empty", "text-danger");
      return;
    }

    const title = number ? `#${number}` : fileName;
    const newFile = {
      name: title,
      description: description,
      status: 'Pending'
    };

    addFile(newFile);
    saveFile(newFile);
    clearForm();
  }

  // Add a new file to the DOM and set up its event listeners
  function addFile(file) {
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-start";
    li.innerHTML = `
      <div class="ms-2 me-auto">
        <div class="fw-bold">${file.name}</div>
        <span class="description">${file.description}</span><br>
        <small>Status: <span class="taskStatus status-pending">${file.status}</span></small>
      </div>
      <div>
        ${createStatusButtons()}
        <button class="btn btn-sm btn-primary editBtn mb-1">Edit</button>
        <button class="btn btn-sm btn-danger deleteBtn">Delete</button>
      </div>
    `;

    li.querySelectorAll('.statusBtn').forEach(btn => {
      btn.addEventListener('click', function () {
        const status = btn.getAttribute('data-status');
        updateTaskStatus(li, file, status);
      });
    });

    li.querySelector('.editBtn').addEventListener('click', function () {
      editDescription(li, file);
    });

    li.querySelector('.deleteBtn').addEventListener('click', function () {
      li.remove();
      deleteFile(file.name);
      displayMessage(`${file.name}: Deleted`, "text-danger");
    });

    elements.taskList.appendChild(li);
    displayMessage("Added new file", "text-success");
  }

  // Edit the task description
  function editDescription(li, file) {
    const descriptionSpan = li.querySelector('.description');
    const originalDescription = descriptionSpan.textContent;

    // Create an input field with the current description
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalDescription;
    input.className = 'form-control mb-1';

    // Replace the description span with the input field
    descriptionSpan.replaceWith(input);

    // Change the Edit button to Save
    const editBtn = li.querySelector('.editBtn');
    editBtn.textContent = 'Save';
    editBtn.classList.remove('btn-primary');
    editBtn.classList.add('btn-success');

    // Add an event listener to save the edited description
    editBtn.removeEventListener('click', function () {});
    editBtn.addEventListener('click', function () {
      const newDescription = input.value.trim();
      if (newDescription) {
        file.description = newDescription;
        input.replaceWith(descriptionSpan);
        descriptionSpan.textContent = newDescription;
        saveFile(file);
        editBtn.textContent = 'Edit';
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-primary');
        editBtn.addEventListener('click', function () {
          editDescription(li, file);
        });
        displayMessage(`${file.name}: Description updated`, "text-success");
      } else {
        displayMessage("Description cannot be empty", "text-danger");
      }
    });
  }

  // Save the new file to localStorage
  function saveFile(file) {
    const files = JSON.parse(localStorage.getItem('files')) || [];
    const index = files.findIndex(f => f.name === file.name);
    if (index >= 0) {
      files[index] = file; // Update existing file
    } else {
      files.push(file); // Add new file
    }
    localStorage.setItem('files', JSON.stringify(files));
  }

  // Save the title to localStorage
  function saveTitle(title) {
    localStorage.setItem('title', title);
  }

  // Load tasks from localStorage
  function loadTasks() {
    const files = JSON.parse(localStorage.getItem('files')) || [];
    files.forEach(addFile);
  }

  // Load the title from localStorage
  function loadTitle() {
    const savedTitle = localStorage.getItem('title');
    if (savedTitle) {
      elements.headerDisplay.textContent = savedTitle;
      elements.headerDisplay.style.display = 'block';
      elements.headerInput.style.display = 'none';
    }
  }

  // Update the status of an existing file in localStorage
  function updateFile(updatedFile) {
    let files = JSON.parse(localStorage.getItem('files')) || [];
    files = files.map(file => file.name === updatedFile.name ? updatedFile : file);
    localStorage.setItem('files', JSON.stringify(files));
  }

  // Delete a file from localStorage
  function deleteFile(fileName) {
    let files = JSON.parse(localStorage.getItem('files')) || [];
    files = files.filter(file => file.name !== fileName);
    localStorage.setItem('files', JSON.stringify(files));
  }

  // Clear all task details from localStorage and reset the list
  function removeAllTasks() {
    clearStorage();
    elements.taskList.innerHTML = '';
    displayMessage("Back to original state.", "text-warning");
  }

  // Clear localStorage
  function clearStorage() {
    localStorage.removeItem('files');
    localStorage.removeItem('title');
   location.reload();
  }

  // Update task status and save to localStorage
  function updateTaskStatus(li, file, status) {
    file.status = status;
    const statusSpan = li.querySelector('.taskStatus');
    statusSpan.textContent = status;
    updateStatusColor(statusSpan, status);
    updateFile(file);
  }

  // Update the status color based on the current status
  function updateStatusColor(statusSpan, status) {
    statusSpan.className = `taskStatus ${getStatusClass(status)}`;
  }

  // Get the appropriate CSS class for a status
  function getStatusClass(status) {
    const statusClasses = {
      'Done': 'status-done',
      'Sent to PR': 'status-pr',
      'Review Received': 'status-review',
      'Approved': 'status-approved',
      'Solution Planned': 'status-fixed',
      'Pending': 'status-pending'
    };
    return statusClasses[status] || 'status-pending';
  }

  function createStatusButtons() {
    const statuses = ['Done', 'Sent to PR', 'Review Received', 'Approved', 'Solution Planned'];
    return statuses.map(status => `
      <button class="btn btn-sm ${getStatusClass(status)} statusBtn mb-1" data-status="${status}">${status}</button>
    `).join('');
  }

  // Display a message to the user
  function displayMessage(text, className) {
    elements.msg.innerHTML = text;
    elements.msg.className = className;
  }

  // Clear form inputs
  function clearForm() {
    elements.taskNumber.value = '';
    elements.taskInput.value = '';
    elements.taskDescription.value = '';
  }
});
