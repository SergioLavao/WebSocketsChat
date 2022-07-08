import os

from flask import Flask,render_template 	 	 		
from flask_socketio import SocketIO, emit
from models import *	

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)	

@app.route("/")
def index():
	return render_template("index.html")	

@socketio.on("connect")
def init_app():
	for channel in channels:
		emit("create channel", {"channel":channel.name})
	for user in users:
		emit("create user", {"username":user})


@socketio.on("new channel")
def new_channel(data):
	if findChannel(data["channel"]):
		return 		
	channel = Channel(data["channel"])	
	channels.append(channel)	
	emit("create channel", {"channel":channel.name},broadcast=True)		

@socketio.on("open channel")
def open_channel(data):
	channel = findChannel(data["channel_name"])	
	emit("open", {"channel":channel.name})	
	for message in channel.messages:
		msglenght = len(channel.messages)	
		emit("set message", {"channel" : channel.name, "user":message.user, "text": message.text, "msglenght":msglenght, "timestamp":message.timestamp, "date":message.date })	

@socketio.on("new message")
def new_message(data):	
	message = Message(data["user"],data["timestamp"], data["text"], data["date"])	
	channel = findChannel(data["channel_name"])	
	channel.messages.append(message)
	msglenght = len(channel.messages)	
	#Only 100 last messages
	if msglenght == 100:
		channel.messages.pop(0)
	emit("set message", {"channel" : channel.name, "user":message.user, "text": message.text, "msglenght":msglenght, "timestamp":message.timestamp, "date":message.date },broadcast=True)	

@socketio.on("delete message")
def delete_message(data):
	channel = findChannel(data["channel"])	
	for message in channel.messages:
		if message.date == data["date"]:	
			emit("remove message",{"date":message.date, "channel": channel.name},broadcast=True)	
			channel.messages.remove(message)

@socketio.on("update users")
def update_users(data):	
	user = data["username"]
	users.append(user)
	emit("create user", {"username":user},broadcast=True)	
