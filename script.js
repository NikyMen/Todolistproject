document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedItem = null;
    let placeholder = null;

    // Theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggleCheckbox.checked = true;
    }

    renderTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskClick);
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('dragend', handleDragEnd);
    taskList.addEventListener('drop', handleDrop);
    themeToggleCheckbox.addEventListener('change', toggleTheme);

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false });
            saveAndRender(true);
            taskInput.value = '';
        }
    }

    function handleTaskClick(event) {
        const target = event.target;
        const li = target.closest('li');
        if (!li) return;

        const index = li.dataset.index;

        if (target.closest('.delete-btn')) {
            deleteTask(index);
        } else if (target.closest('.edit-btn')) {
            editTask(index);
        } else if (target.tagName !== 'INPUT') {
            toggleTaskComplete(index);
        }
    }

    function deleteTask(index) {
        const li = taskList.querySelector(`[data-index="${index}"]`);
        li.classList.add('fade-out');
        li.addEventListener('animationend', () => {
            tasks.splice(index, 1);
            saveAndRender();
        });
    }

    function editTask(index) {
        const li = taskList.querySelector(`[data-index="${index}"]`);
        const taskTextSpan = li.querySelector('.task-text');
        const currentText = tasks[index].text;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');

        li.replaceChild(input, taskTextSpan);
        li.querySelector('.task-actions').style.display = 'none';
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            tasks[index].text = newText || currentText;
            saveAndRender();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                saveAndRender();
            }
        });
    }

    function toggleTaskComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveAndRender();
    }

    function saveAndRender(isNewTask = false) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(isNewTask);
    }

    function renderTasks(isNewTask = false) {
        const lastTaskIndex = tasks.length - 1;
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            li.dataset.index = index;
            li.draggable = true;
            if (task.completed) {
                li.classList.add('completed');
            }

            if (isNewTask && index === lastTaskIndex) {
                li.classList.add('fade-in');
            }

            const taskText = document.createElement('span');
            taskText.textContent = task.text;
            taskText.classList.add('task-text');

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('task-actions');

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            editBtn.classList.add('edit-btn');

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.classList.add('delete-btn');
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(taskText);
            li.appendChild(actionsDiv);
            taskList.appendChild(li);
        });
    }

    function handleDragStart(event) {
        draggedItem = event.target;
        setTimeout(() => {
            event.target.classList.add('dragging');
        }, 0);

        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
    }

    function handleDragOver(event) {
        event.preventDefault();
        const afterElement = getDragAfterElement(taskList, event.clientY);
        if (afterElement == null) {
            taskList.appendChild(placeholder);
        } else {
            taskList.insertBefore(placeholder, afterElement);
        }
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
        if(placeholder && placeholder.parentNode){
            placeholder.parentNode.removeChild(placeholder);
        }
        placeholder = null;
    }

    function handleDrop(event) {
        const fromIndex = parseInt(draggedItem.dataset.index, 10);
        const toIndex = Array.from(taskList.children).indexOf(placeholder);

        const [removed] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, removed);

        saveAndRender();
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function toggleTheme() {
        if (themeToggleCheckbox.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }
});