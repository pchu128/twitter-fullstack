
//監聽"送出"button
document.getElementById("inputMsgButton").addEventListener('click', () => {
  Send();
});

//送出訊息
function Send() {
  let userId = document.querySelector('#inputChatName').dataset.userid
  let name = document.querySelector('#inputChatName').innerHTML;
  let msg = document.querySelector('#inputChatMsg').value;
  if (!msg) {
    alert('請輸入訊息');
    return;
  }
  //console.log('here is name.innerHTLM', name)
  let data = {
    userId: userId,
    name: name,
    msg: msg,
  };
  console.log('send message date:', data)
  socket.emit('message', data);
  //清空原輸入訊息
  document.querySelector('#inputChatMsg').value = '';
}

//取得history並顯示
socket.on('history', (obj) => {
  if (obj.length > 0) {
    appendHistoryData(obj)
  }
});

socket.on('message', (obj) => {
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
                    <div class="chatName" data-userid="${element.userId}">${element.name}：</div>
                    <div class="chatMsg">${element.msg}</div>
                </div>
                <div class="time">${moment(element.time).fromNow()}</div>
            </div>
            `;
  });
  el.innerHTML = html.trim();
  scrollWindow()
}

function appendHistoryData(obj) {
  let el = document.querySelector('.chats');
  let html = el.innerHTML;

  obj.forEach(element => {
    html += `
        <div class="chat">
          <div class="group">
            <div class="chatName" id="chatName" data-userid="${element.User.id}">
              <a href="/users/${element.User.id}/tweets">
                <img class="rounded-circle" style="width: 30px;" src="${element.User.avatar}" />
                <span>${element.User.name}</span>
              </a>：
            </div>
            <div class="chatMsg">${element.message}</div>
          </div>
          <div class="time">${moment(element.createdAt).fromNow()}</div>
        </div>
            `;
  });
  el.innerHTML = html.trim();
  scrollWindow()
}
//卷軸自動捲到底
function scrollWindow() {
  let h = document.querySelector('.chats');
  h.scrollTo(0, h.scrollHeight);
}