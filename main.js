$(document).ready(function() {
    function loadTasks(status = 'all') {
        $.ajax({
            url: 'http://localhost:3000/tasks?action=list&status=' + status + '&user_id=' + user_id,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                $('#taskList').empty();
                data.forEach(function(task) {
                    $('#taskList').append(`
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <input type="text" class="form-control-plaintext" value="${task.name}" readonly>
                            <div>
                                <button class="btn btn-success btn-sm toggleTask" data-id="${task.id}" data-user_id="${task.user_id}" data-status="${task.status}">
                                    ${task.status === 'pending' ? 'Concluir' : 'Desmarcar'}
                                </button>
                                <button class="btn btn-warning btn-sm editTask" data-id="${task.id}" data-user_id="${task.user_id}" data-name="${task.name}">Editar</button>
                                <button class="btn btn-danger btn-sm deleteTask" data-id="${task.id}" data-user_id="${task.user_id}">Excluir</button>
                            </div>
                        </li>
                    `);
                });
            }
        });
    }

    loadTasks();

    $('#taskForm').on('submit', function(e) {
        e.preventDefault();
        const name = $('#taskName').val();
        const user_id = $('#taskName').data('user_id'); 
        $.ajax({
            url: 'http://localhost:3000/tasks?action=add',  // URL do endpoint Flask
            method: 'POST',
            data: { name: name, user_id: user_id },
            dataType: 'json',
            success: function(response) {
                $('#taskName').val('');
                loadTasks();
            }
        });
    });
    

    $('#taskList').on('click', '.toggleTask', function() {
        const id = $(this).data('id');
        const status = $(this).data('status');    
        const user_id = $(this).data('user_id');
        $.ajax({
            url: 'http://localhost:3000/tasks?action=toggle',
            method: 'GET',
            data: { id: id, status: status, user_id: user_id },
            dataType: 'json',
            success: function(response) {
                loadTasks();
            }
        });
    });

    $('#taskList').on('click', '.editTask', function() {
        const id = $(this).data('id');
        const user_id = $(this).data('user_id');
        const name = prompt('Edit task name:', $(this).data('name'));
        if (name) {
            $.ajax({
                url: 'http://localhost:3000/tasks?action=update',
                method: 'POST',
                data: { id: id, name: name, user_id: user_id },
                dataType: 'json',
                success: function(response) {
                    loadTasks();
                }
            });
        }
    });

    $('#taskList').on('click', '.deleteTask', function() {
        const id = $(this).data('id');
        const user_id = $(this).data('user_id');
        $.ajax({
            url: 'http://localhost:3000/tasks?action=delete',
            method: 'POST',
            data: { id: id, user_id: user_id },
            dataType: 'json',
            success: function(response) {
                loadTasks();
            }
        });
    });

    $('#showAll').on('click', function() {
        loadTasks('all');
    });

    $('#showPending').on('click', function() {
        loadTasks('pending');
    });

    $('#showCompleted').on('click', function() {
        loadTasks('completed');
    });
});
