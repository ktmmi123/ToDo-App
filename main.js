const tasks = [];
let lastTaskId = 0;

let taskList;
let addTask;

// kui leht on brauseris laetud siis lisame esimesed taskid lehele
window.addEventListener('load', () => {
    taskList = document.querySelector('#task-list');
    addTask = document.querySelector('#add-task');

    fetchTasks();

    addTask.addEventListener('click', () => {
        const task = createTask();
        renderTask(task);
    });
});

function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}

function createTask() {
    lastTaskId++;

    const task = {
        id: lastTaskId,
        title: 'New Task ' + lastTaskId,
        desc: '',
        marked_as_done: false,
        created_at: new Date().toLocaleString() 
    };

    fetch('http://demo2.z-bit.ee/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mErAbJ0UQaJHWQcYSquHtbzu2aQ7GJFU',
        },
        body: JSON.stringify(task),
    })
    .then(response => response.json())
    .then(result => {
        task.id = result.id; 
        tasks.push(task);
    })
    .catch(error => console.error('Error adding task:', error));

    return task;
}

function deleteTask(task, taskRow) {
    
    fetch(`http://demo2.z-bit.ee/tasks/${task.id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer mErAbJ0UQaJHWQcYSquHtbzu2aQ7GJFU',
        },
    })
    .then(response => {
        if (response.ok) {
            taskList.removeChild(taskRow);
            tasks.splice(tasks.indexOf(task), 1);
        } else {
            console.error('Error deleting task:', response.statusText);
        }
    })
    .catch(error => console.error('Error deleting task:', error));
}

function fetchTasks() {
    
    fetch('http://demo2.z-bit.ee/tasks', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer mErAbJ0UQaJHWQcYSquHtbzu2aQ7GJFU',
        },
    })
    .then(response => response.json())
    .then(data => {
        tasks.push(...data); 
        tasks.forEach(renderTask); 
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

function createTaskRow(task) {
    const taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template');

    const name = taskRow.querySelector("[name='name']");
    name.value = task.title;

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.marked_as_done;

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => deleteTask(task, taskRow));

    hydrateAntCheckboxes(taskRow);

    return taskRow;
}

function createAntCheckbox() {
    const checkbox = document.querySelector('[data-template="ant-checkbox"]').cloneNode(true);
    checkbox.removeAttribute('data-template');
    hydrateAntCheckboxes(checkbox);
    return checkbox;
}

/**
 * See funktsioon aitab lisada eridisainiga checkboxile vajalikud event listenerid
 * @param {HTMLElement} element Checkboxi wrapper element või konteiner element mis sisaldab mitut checkboxi
 */
function hydrateAntCheckboxes(element) {
    const elements = element.querySelectorAll('.ant-checkbox-wrapper');
    for (let i = 0; i < elements.length; i++) {
        let wrapper = elements[i];

        // Kui element on juba töödeldud siis jäta vahele
        if (wrapper.__hydrated)
            continue;
        wrapper.__hydrated = true;

        const checkbox = wrapper.querySelector('.ant-checkbox');

        // Kontrollime kas checkbox peaks juba olema checked, see on ainult erikujundusega checkboxi jaoks
        const input = wrapper.querySelector('.ant-checkbox-input');
        if (input.checked) {
            checkbox.classList.add('ant-checkbox-checked');
        }

        // Kui checkboxi või label'i peale vajutatakse siis muudetakse checkboxi olekut
        wrapper.addEventListener('click', () => {
            input.checked = !input.checked;
            checkbox.classList.toggle('ant-checkbox-checked');
        });
    }
}
