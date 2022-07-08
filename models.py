channels = []
users = []

class Message:	
	def __init__(self, user,timestamp, text, date):
		self.user = user
		self.timestamp = timestamp	
		self.text = text
		self.date = date 	

class Channel:
	def __init__(self, name):
		self.name = name
		self.messages = []	

def findChannel(name):
	for channel in channels:
		if channel.name == name:
			return channel 	