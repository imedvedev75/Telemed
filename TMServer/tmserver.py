from flask import *
from config import *
import json
import os
from flask_socketio import *
from requests import get
from riotConnector import RiotConnector
import logging
import configparser
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from login import MyLoginManager, User
from pymongo import MongoClient
from flask_cors import CORS, cross_origin
from utils import *

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
sio = SocketIO(app)
CORS(app, supports_credentials=True)
app.json_encoder = MyJSONEncoder

socket_users = dotdict({})
rooms = dotdict({})
offers = {}

config = configparser.ConfigParser()
config.read('config.ini')
username = config['settings']['username']
password = config['settings']['password']
server = config['settings']['server']
secret_key = config['settings']['secret_key']

mdb = MongoClient(f"mongodb://{username}:{password}@{server}/telemed").telemed

#init login manager
login_manager = MyLoginManager(app, mdb.users)
app.config.update(DEBUG=True, SECRET_KEY=secret_key)

def send_file(socket_userspath):
    return send_from_directory(".", path)


def connect():
    print("connect request from {}".format(request.sid))


def delUser(id):
    del socket_users[id]
    if id in offers.keys():
        del offers[id]


def disconnect():
    print("disconnect request from {}".format(request.sid))
    for id in socket_users.keys():
        if socket_users[id]["sid"] == request.sid:
            print("user {} has been disconnected, removing".format(id))
            delUser(id)
            break


def login(data):
    r = data["email"]
    print('login request from  ' + r)
    socket_users[r] = {"sid": request.sid}
    emit('logged', {"summonerId":r})


def call(data):
    data = dotdict(data)
    if data.recip in socket_users.keys():
        emit("call", data, room=socket_users[data.recip]["sid"])


def hangup(data):
    fromId = data['from']
    room = data['room']
    if room in rooms.keys():
        for part in rooms[room]:
            if part != fromId:
                if part in socket_users.keys():
                    emit("hangup", data, room=socket_users[part]["sid"])
        rooms[room].remove(fromId)


def logout(data):
    id = data["myId"]
    if id in socket_users.keys():
        print("user {} logged off, removing".format(id))
        delUser(id)


def join(data):
    data = dotdict(data)
    email = data.email
    room = data.room
    if not room in rooms.keys():
        rooms[room] = []
    if not email in rooms[room]:
        rooms[room].append(email)
    socket_users[email] = {"sid": request.sid}
    parts = list(set(rooms[room]) - set([email]))
    print('join: ' + str(parts))
    emit("connectTo", {"peersToConnect": parts})


def connectToOthers(summId, parts):
    peersToConnect = []
    for part in parts:
       peersToConnect.append([partId, partName])
    emit("connectTo", {"peersToConnect": peersToConnect})


def offer(data):
    fromId = data["from"]
    toId = data["to"]

    if not toId in socket_users.keys():   #if participant is not connected
        return

    print('sending offer to ' + toId)
    send_message('offer', data)


def answer(data):
    fromId = data["from"]
    toId = data["to"]
    send_message('answer', data)


def candidate(data):
    send_message('candidate', data)


def send_message(type, data):
    to = data['to']
    if to in socket_users.keys():
        emit(type, data, room=socket_users[to]["sid"])


sio.on_event('connect', connect)
sio.on_event('disconnect', disconnect)
sio.on_event('login', login)
sio.on_event('logout', logout)
sio.on_event('offer', offer)
sio.on_event('answer', answer)
sio.on_event('candidate', candidate)
sio.on_event('join', join)
sio.on_event('hangup', hangup)


@cross_origin(supports_credentials=True)
@app.route('/', methods=['GET'])
def home():
    return 'Hi hi hi from TM backend'


@app.route('/check_login', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def check_login():
    return jsonify({'email': current_user.u.email}), 200


@app.route('/save_profile', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def save_profile():
    profile = request.get_json(force=True)
    mdb.users.update({'email': current_user.u.email}, {'$set': {'profile': profile}})
    return jsonify({}), 200


@app.route('/get_profile', methods=['POST'])
@login_required
@cross_origin(supports_credentials=True)
def get_profile():
    data = dotdict(request.get_json(force=True))
    ret = dotdict(mdb.users.find_one({'email': current_user.u.email}))
    if ret.profile:
        return return_coll(ret.profile)
    else:
        return jsonify(None), 200


def run():
    if "HETZNER" not in os.environ:
        print('running locally')
        print(os.environ)
        sio.run(app, host='0.0.0.0', port=5006, debug=True, use_reloader=True,
                     certfile='cert/cert.pem',
                     keyfile='cert/key.pem')
    else:
        if "DEBUG" not in os.environ:
            sio.run(app, host='0.0.0.0', port=5008, debug=True, use_reloader=True,
                         certfile='/etc/letsencrypt/live/ai-m.org/fullchain.pem',
                         keyfile='/etc/letsencrypt/live/ai-m.org/privkey.pem')
        else:
            sio.run(app, host='0.0.0.0', port=5007, debug=True, use_reloader=True,
                         certfile='/etc/letsencrypt/live/ai-m.org/fullchain.pem',
                         keyfile='/etc/letsencrypt/live/ai-m.org/privkey.pem')


if __name__ == "__main__":
    run()

