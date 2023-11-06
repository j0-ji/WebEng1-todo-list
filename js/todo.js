'use strict';

let BreakException = {};

class Project {
    name;
    description;
    tasks;
    domElement;
    selected = false;

    constructor(_name, _description) {
        this.name = _name;
        this.description = _description;
        this.tasks = [];
    }

    buildProjectDOM() {
        let projectView = document.getElementById('project-view');

        this.domElement = document.createElement('div');
        let name = document.createElement('h4');
        let button1 = document.createElement('img');
        let button2 = document.createElement('img');
        let description = document.createElement('p');

        this.domElement.classList.add('project');
        this.domElement.addEventListener('click', () => {
            this.switchSelect();
            manager.clearTasks();
            // TODO: display project info in right view
            this.buildTaskDOMs();
        });

        name.classList.add('project-name');
        name.innerText = this.name;
        this.domElement.appendChild(name);

        button1.classList.add('project-edit');
        button1.alt = 'Edit';
        button1.src = ''; // TODO: add src for edit-button
        button1.addEventListener('click', () => {
            // TODO: add edit mode
        });
        this.domElement.appendChild(button1);

        button2.classList.add('project-delete');
        button2.alt = 'Del';
        button2.src = ''; // TODO: add src for delete-button
        button2.addEventListener('click', () => {
            // removes all tasks of project
            while(this.tasks.length !== 0) {
                this.tasks[0].removeTask(this);
                managerLS.saveToLocalStorage();
            }
            // removes project
            this.domElement.remove();
            manager.projects.splice(manager.projects.indexOf(this), 1);
            managerLS.saveToLocalStorage();

            if(this.selected) {
                manager.currentProject = manager.projects[0];
                manager.projects[0].switchSelect();
            }

            console.log(manager.projects);
        });
        this.domElement.appendChild(button2);

        description.classList.add('project-description');
        description.innerText = this.description;
        this.domElement.appendChild(description);

        projectView.prepend(this.domElement);
    }

    switchSelect() {
        if(!this.selected) {
            Array.prototype.forEach.call(manager.projects, (project) => {
                project.selected = false;
                try {
                    project.domElement.classList.remove('selected');
                    // remove intervalls of tasks from previous project
                    Array.prototype.forEach.call(project.tasks, (_task) => {
                        clearInterval(_task.intervallID);
                    });
                } catch (ignored) {}
            });
            manager.currentProject = this;
            this.selected = true;
            managerLS.saveToLocalStorage();
            this.domElement.classList.add('selected');
        }
    }

    buildTaskDOMs() {
        if(this.tasks.length !== 0) {
            Array.prototype.forEach.call(this.tasks, (task) => {
                task.buildTaskDOM(this);
                // TODO: manage Task Intervall IDs !!!
            });
        }
    }
}

class Task {
    name;
    description;
    dateCreated;
    dateCreated1970;
    dateDue;
    dateDue1970;
    domElement;
    intervallID;

    constructor(_name, _description, _dateDue) {
        this.name = _name;
        this.description = _description;
        this.dateCreated = new Date();
        this.dateCreated1970 = this.dateCreated.getTime();
        this.dateDue = new Date(_dateDue);
        this.dateDue1970 = this.dateDue.getTime();
    }

    buildTaskDOM(_project) {
        let taskView = document.getElementById('task-view');

        this.domElement = document.createElement('div');
        let name = document.createElement('h4');
        let button1 = document.createElement('img');
        let button2 = document.createElement('img');
        let description = document.createElement('p');
        let dateIcon = document.createElement('img');
        let textCreated = document.createElement('p');
        let dateCreated = document.createElement('p');
        let textDue = document.createElement('p')
        let dateDue = document.createElement('p');

        this.domElement.classList.add('task');
        this.domElement.addEventListener('click', () => {
            // TODO: display task-info in info-view on right side
            // TODO: add 'active'-state background-switch
        });

        name.classList.add('task-name');
        name.innerText = this.name;
        this.domElement.appendChild(name);

        button1.classList.add('task-edit');
        button1.alt = 'Edit';
        button1.src = ''; // TODO: add src for edit-button
        button1.addEventListener('click', () => {
            // TODO: add edit mode
        })
        this.domElement.appendChild(button1);

        button2.classList.add('task-delete');
        button2.alt = 'Del';
        button2.src = ''; // TODO: add src for delete-button
        button2.addEventListener('click', () => {
            this.removeTask(_project);
            managerLS.saveToLocalStorage();
        });
        this.domElement.appendChild(button2);

        description.classList.add('task-description');
        description.innerText = this.description;
        this.domElement.appendChild(description);

        dateIcon.classList.add('task-duedate-img');
        dateIcon.alt = 'Time';
        dateIcon.src = ''; // TODO: add src for date-icon
        this.domElement.appendChild(dateIcon);

        textCreated.classList.add('task-created-text');
        textCreated.innerText = 'Created:';
        this.domElement.appendChild(textCreated);

        let createdDate = `${this.dateCreated.getDate()}-${(this.dateCreated.getMonth() + 1).toString().padStart(2, '0')}-${this.dateCreated.getFullYear()}`;
        dateCreated.classList.add('task-created-time');
        dateCreated.innerText = createdDate;
        this.domElement.appendChild(dateCreated);

        textDue.classList.add('task-duedate-text');
        textDue.innerText = 'Due:';
        this.domElement.appendChild(textDue);

        let duedDate = `${this.dateDue.getDate().toString().padStart(2, '0')}-${(this.dateDue.getMonth() + 1).toString().padStart(2, '0')}-${this.dateDue.getFullYear()}`;
        dateDue.classList.add('task-duedate-time');
        dateDue.innerText = duedDate;
        this.domElement.appendChild(dateDue);

        taskView.prepend(this.domElement);

        this.highlightTask(this.dateDue1970);
        this.intervallID = setInterval(() => {
            this.highlightTask(this.dateDue1970);
        }, 1000);
    }

    highlightTask(_dateDue1970) {
        let now = new Date().getTime();
        let timeDifference = _dateDue1970 - now;
        console.log(this.name + " :: " + timeDifference);
        if(timeDifference < 1000*60*60*24*2 && timeDifference > 0) {
            this.domElement.classList.add('highlight-twoDays')
        } else if(timeDifference <= 0) {
            try {
                this.domElement.classList.remove('highlight-twoDays');
            } catch (ignored) {}
            this.domElement.classList.add('highlight-missed');
        }
    }

    removeTask(_project) {
        this.domElement.remove();
        _project.tasks.splice(_project.tasks.indexOf(this), 1);
        clearInterval(this.intervallID);
    }
}

class ToDoManager {
    projects;
    currentProject;

    constructor() {
        this.projects = [];
    }

    addProject() {
        let inputName = document.getElementById('input-project-name').value;
        let inputDesc = document.getElementById('input-project-description').value;

        if(inputName === "" || inputName === null) {
            alert('Bitte Name eingeben');
            return false;
        }

        let project = new Project(inputName, inputDesc);
        project.buildProjectDOM();
        this.clearTasks();
        this.projects.push(project);
        project.switchSelect();
        console.log(this.projects);

        return true;
    }

    cancelProject() {
        document.getElementById('input-project-name').value = '';
        document.getElementById('input-project-description').value = '';
    }

    clearTasks() {
        let taskView = document.getElementById('task-view');

        while(taskView.children[1]) {
            taskView.removeChild(taskView.firstChild);
        }
    }

    addTask() {
        let inputName = document.getElementById('input-task-name').value;
        let inputDescription = document.getElementById('input-task-description').value;
        let inputDate = document.getElementById('input-task-duedate').value;

        if(inputName === '' || inputName === null) {
            alert('Bitte Name eingeben');
            return false;
        }
        if(inputDate === '' || inputDate === null) {
            alert('Bitte Datum eingeben');
            return false;
        }

        let task = new Task(inputName, inputDescription, inputDate);

        Array.prototype.forEach.call(this.projects, (project) => {
            try {
                if(project.selected) {
                    task.buildTaskDOM(project);
                    project.tasks.push(task);
                    console.log(project);
                    throw BreakException; // used to escape forEach-call when project found
                }
            } catch (ignored) {}
        });
        return true;
    }

    clearInputs() {
        let inputs = document.getElementsByClassName('inputs');
        Array.prototype.forEach.call(inputs, (input) => {
            input.value = '';
        })
    }

    closeInfoInputViews() {
        let views = document.getElementsByClassName('views');

        Array.prototype.forEach.call(views, (view) => {
            try {
                view.classList.remove('active');
            } catch (ignored) {}
            try {
                view.classList.add('inactive')
            } catch (ignored) {}
        });
    }

    setEventListeners() {
        // PROJECT
        document.getElementById('project-create').addEventListener('click', () => {
            this.closeInfoInputViews();
            this.clearInputs();
            let view = document.getElementById('create-or-edit-project');
            view.classList.add('active');
            view.classList.remove('inactive');
        });
        document.getElementById('submit-project').addEventListener('click', () => {
            let check = this.addProject();
            if(!check) {
                return;
            }
            this.clearInputs();
            this.closeInfoInputViews();
            managerLS.saveToLocalStorage();
        });
        document.getElementById('cancel-project').addEventListener('click', () => {
            this.cancelProject();
        });

        // TASK
        document.getElementById('task-create').addEventListener('click', () => {
            if(this.projects.length === 0) {
                alert('Create a new Project/Group before adding tasks.');
            } else {
                let flag = false;
                Array.prototype.forEach.call(this.projects, (project) => {
                    if(project.selected) {
                        flag = true;
                    }
                });
                if(flag) {
                    this.closeInfoInputViews();
                    this.clearInputs();
                    let view = document.getElementById('create-or-edit-task');
                    view.classList.add('active');
                    view.classList.remove('inactive');
                } else {
                    alert('Please choose a Project you want to add tasks toä')
                }
            }
        });
        document.getElementById('submit-task').addEventListener('click', () => {
            let check = this.addTask();
            if(!check) {
                return;
            }
            this.clearInputs();
            this.closeInfoInputViews();
            managerLS.saveToLocalStorage();
        });
    }
}

class LocalStorageManager {
    saveToLocalStorage() {
        localStorage.setItem('todoAPP', JSON.stringify(manager))
    }

    restoreFromLocalStorage() {
            let todoManager =  localStorage.getItem('todoAPP');
            if(todoManager !== null) {
                let __manager = JSON.parse(todoManager);
                let _manager = new ToDoManager();
                _manager.projects = [];
                _manager.currentProject = null;

                // CODE AUS ANDERER METHODE
                if(__manager.projects.length !== 0) {
                    Array.prototype.forEach.call(__manager.projects, (_project) => {
                        let project = new Project(_project.name, _project.description);
                        project.selected = _project.selected;
                        console.log(project.selected);
                        project.tasks = [];
                        project.buildProjectDOM();

                        if(_project.tasks.length !== 0) {
                            Array.prototype.forEach.call(_project.tasks, (_task) => {
                                let task = new Task(_task.name, _task.description, _task.dateDue);
                                project.tasks.push(task);
                            });
                        }

                        if(project.selected) {
                            project.domElement.classList.add('selected');
                            _manager.currentProject = project;
                            Array.prototype.forEach.call(project.tasks, (task) => {
                                task.buildTaskDOM(project);
                                console.log('built task dom')
                            });
                        }

                        _manager.projects.push(project)
                    })
                } else {
                    _manager.currentProject = null;
                }
                //

                return _manager;
            } else {
                return new ToDoManager();
            }
    }
}

let managerLS = new LocalStorageManager();
let manager = managerLS.restoreFromLocalStorage();

window.onload = () => {
    console.log(manager);
    manager.setEventListeners();
    console.log(manager.projects);
}