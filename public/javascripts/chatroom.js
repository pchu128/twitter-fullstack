console.log('this is chatroom.js')
console.log('Selector:', document.getElementById("msgButton").innerHTML)

document.getElementById("msgButton").addEventListener('click', () => {
  console.log('chick send=======')
  Send();
});

function Send() {

  let name = document.querySelector('#chatName').value;
  let msg = document.querySelector('#chatMsg').value;
  if (!msg && !name) {
    alert('請輸入大名和訊息');
    return;
  }
  let data = {
    name: name,
    msg: msg,
  };
  socket.emit('message', data);
  document.querySelector('#msg').value = '';
}

socket.on('message', (obj) => {
  console.log(obj);
  appendData([obj]);
});

function appendData(obj) {

  let el = document.querySelector('.chats');
  let html = el.innerHTML;

  obj.forEach(element => {
    html +=
      `
            <div class="chat">
                <div class="group">
                    <div class="name">${element.name}：</div>
                    <div class="msg">${element.msg}</div>
                </div>
                <div class="time">${moment(element.time).fromNow()}</div>
            </div>
            `;
  });
  el.innerHTML = html.trim();
}