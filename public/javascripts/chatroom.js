
//監聽"送出"button
document.getElementById("msgButton").addEventListener('click', () => {
  Send();
});

//送出訊息
function Send() {
  let name = document.querySelector('#chatName').innerHTML;
  let msg = document.querySelector('#chatMsg').value;
  if (!msg) {
    alert('請輸入訊息');
    return;
  }
  //console.log('here is name.innerHTLM', name)
  let data = {
    name: name,
    msg: msg,
  };
  socket.emit('message', data);
  //清空原輸入訊息
  document.querySelector('#chatMsg').value = '';
}

socket.on('message', (obj) => {
  console.log(obj);
  appendData([obj]);
});

//將訊息加入聊天內容
function appendData(obj) {

  let el = document.querySelector('.chats');
  let html = el.innerHTML;

  obj.forEach(element => {
    html +=
      `
            <div class="chat">
                <div class="group">
                    <div class="chatName">${element.name}：</div>
                    <div class="chatMsg">${element.msg}</div>
                </div>
                <div class="time">${moment(element.time).fromNow()}</div>
            </div>
            `;
  });
  el.innerHTML = html.trim();
}