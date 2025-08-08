document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedItem = null;
    let placeholder = null;

    renderTasks();

    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskClick);
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('dragend', handleDragEnd);
    taskList.addEventListener('drop', handleDrop);

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            saveAndRender();
        }
    }

    function handleTaskClick(event) {
        const target = event.target;
        if (target.classList.contains('delete-btn')) {
            const index = target.parentElement.dataset.index;
            deleteTask(index);
        } else if (target.tagName === 'LI') {
            const index = target.dataset.index;
            toggleTaskComplete(index);
        }
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveAndRender();
    }

    function toggleTaskComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = task.text;
            li.dataset.index = index;
            li.draggable = true;
            if (task.completed) {
                li.classList.add('completed');
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.classList.add('delete-btn');
            
            li.appendChild(deleteBtn);
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
});
