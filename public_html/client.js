const socket = io({});

socket.on('connect', () => {
    console.log('Connected to server');

    socket.emit("hello", "world");

    socket.emit('room','room');

    socket.on('broadcast', m => console.log('Received broadcast:', m));

    socket.on('joined', m => console.log('User Joined to room'));

    socket.on('leave', m => console.log('User Leave room'));



});



socket.on('disconnect', () => {
    console.log('Disconnected from server');
});



const username = document.getElementById('username');
$('#send').on('click', function(){
    let name = $('#username').val();
    let msg = $('#msg').val();
    console.log(name + msg);

    let data = {name: name, msg: msg};
    socket.emit('message', data);
    $('#msg').val('');
    $('#username').val('');

    socket.on('message', (data) => {
        console.log(Object(data));

        $('#messages').append(`
        <li class="item-group-list">
            ${Object(data)['msg']}
            <br/>
            <strong>Username</strong> ${Object(data)['name']}
        </li>
        `)
    });
});