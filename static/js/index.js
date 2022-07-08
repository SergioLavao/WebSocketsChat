const user = localStorage.getItem("username");
var lastchannel = localStorage.getItem("lastchannel");
var cur_channel;

document.addEventListener('DOMContentLoaded', ()=>{

	//localStorage.clear(); 

	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	socket.on('connect', ()=>{
		
		//Validate user
		if(user){
			document.getElementById("overlay").style.display = "none";
			socket.emit('open channel', {'channel_name':lastchannel});
		}

		//Create new user
		document.querySelector('#form').onsubmit = ()=>{
			const username = document.querySelector('#username').value;
			localStorage.setItem("username", username);
			localStorage.setItem("lastchannel", "Main Channel")	
			socket.emit('update users', {'username':username});	
			socket.emit('open channel', {'channel_name':"Main Channel"});
		};

		//New Channel Submit
		document.querySelector('#new-channel').onsubmit = ()=>{
			const channel = document.querySelector('#channel-name').value;
			socket.emit('new channel', {'channel':channel})	
			document.querySelector('#channel-name').value = '';
			return false;
		};
	});

	socket.on('msg', () => {
	  console.log('log passed');
	});
	//Open Channel
	socket.on('open', data =>{

		let channelwarning = document.getElementById(`${data.channel}`);

		if(channelwarning){
			channelwarning.remove();
		}

		document.querySelector('#channel-title').innerHTML = data.channel;

		console.log(`Channel ${data.channel} Opened`);

		//New Message Submit
		document.querySelector('#new-message').onsubmit = ()=>{
			const text = document.querySelector('#message').value;
			const d = new Date();
			const time = d.getDate() + "-" + (d.getMonth() + 1 ) + "-" + d.getFullYear() + "	" + d.getHours() + ":" + d.getMinutes();
			socket.emit('new message', {'channel_name':data.channel,'user':user,'timestamp':time , 'text':text, 'date': d});
			document.querySelector('#message').value = '';
			return false;
		};

	});

	socket.on('create channel', data => {

		const li = document.createElement('li');
		const a = document.createElement('a');

		a.innerHTML = `${data.channel}`;
		a.className = "text-white text-decoration-none open-channel";
		a.setAttribute("data-channel", `${data.channel}`);
		a.setAttribute("type", 'submit');

		li.appendChild(a);
		document.querySelector('#channels').append(li);
		console.log(`${data.channel} has added`);

		//Channel open on click
		document.querySelectorAll('.open-channel').forEach(a =>{
				a.onclick = ()=>{
					deleteMessagesChild();
					const channel = a.dataset.channel;
					localStorage.setItem("lastchannel", channel);
					cur_channel = channel;
					socket.emit('open channel', {'channel_name':channel});
				}
		});
	});

	//Create user
	socket.on('create user',data => {

		if (data.username == user) {return;}
		console.log('username setted');
		const li = document.createElement('li');
		const a = document.createElement('a');

		a.innerHTML = `${data.username}`;

		li.appendChild(a);
		document.querySelector('#usernames').append(li);

	return false
	});


	//Set message on Channel
	socket.on('set message',data => {
		if(cur_channel != data.channel){
			if (document.getElementById(`${data.channel}`)) {return}
			let div = document.createElement('div');
			div.id = data.channel;
			div.className = "alert alert-warning m-2";
			div.innerHTML = "New messages from" + data.channel;
			main = document.querySelector('.channels');
			main.append(div);
			return
		}

		const maindiv = document.createElement('div');
		const div1 = document.createElement('a');
		const h2 = document.createElement('h2');
		const small = document.createElement('small');
		const p = document.createElement('p');
		const msg_time = document.createElement('small');

		small.innerHTML = data.user;
		p.innerHTML = data.text;
		msg_time.innerHTML = data.timestamp;

		h2.appendChild(small);
		div1.appendChild(h2);
		div1.appendChild(p);
		div1.appendChild(msg_time);

		maindiv.setAttribute("data-channel", `${data.channel}`);
		maindiv.setAttribute("data-date", `${data.date}`);

		if (data.user == user){
			maindiv.className = "row justify-content-end";
			div1.className = "col-8 shadow-sm m-2 alert alert-success";
			if(data.date){
			const p = document.createElement('small');
			p.setAttribute("type", 'submit');
			p.className = "m-2 delete-message";
			p.innerHTML = 'Delete message';
			div1.appendChild(p);
			}
		}else{
			maindiv.className = "row justify-content-start messagediv";
			div1.className = "col-8 alert alert-info shadow-sm m-2";
		}
		maindiv.appendChild(div1);
		messages.append(maindiv);
		document.querySelectorAll('.delete-message').forEach(p =>{
			p.onclick = ()=>{
				channel = p.parentNode.parentNode.getAttribute("data-channel");
				date = p.parentNode.parentNode.getAttribute("data-date");
				console.log(`Deleted ${date} at ${channel}`);
				socket.emit('delete message', {'channel': channel,'date':date});
			}
		});
		console.log(`Message from channel ${data.channel}, total: ${data.msglenght}`);
	return false;
	});

	socket.on('remove message', data =>{
		if(cur_channel != data.channel){
			return;
		}
		div = document.querySelector(`[data-date="${data.date}"]`);
		console.log(`Removed ${div}`);
		div.remove(div);	
	});

function deleteMessagesChild() { 
    var e = document.querySelector("#messages"); 
    var first = e.firstElementChild; 
	while (first) { 
        first.remove(); 
		first = e.firstElementChild; 
	} 
} 
//Asign username's field text 
document.querySelector('.username').innerHTML = user;
});