from flask import Flask, jsonify, request, json, Response, render_template
from flask_mysqldb import MySQL
from datetime import datetime
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)
from pywebpush import webpush, WebPushException
from celery import Celery

import logging
import json, os

app = Flask(__name__)
app.config.from_object("config")
app.secret_key = app.config['SECRET_KEY']

# client = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
# client.conf.update(app.config)

DER_BASE64_ENCODED_PRIVATE_KEY_FILE_PATH = os.path.join(os.getcwd(),"private_key.txt")
DER_BASE64_ENCODED_PUBLIC_KEY_FILE_PATH = os.path.join(os.getcwd(),"public_key.txt")

VAPID_PRIVATE_KEY = open(DER_BASE64_ENCODED_PRIVATE_KEY_FILE_PATH, "r+").readline().strip("\n")
VAPID_PUBLIC_KEY = open(DER_BASE64_ENCODED_PUBLIC_KEY_FILE_PATH, "r+").read().strip("\n")

VAPID_CLAIMS = {
"sub": "mailto:siddhant@gmail.com"
}

app.config['MYSQL_HOST'] = 'sql12.freesqldatabase.com'
app.config['MYSQL_USER'] = 'sql12339238'
app.config['MYSQL_PASSWORD'] = 'JITRpmJLm1'
app.config['MYSQL_DB'] = 'sql12339238'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['JWT_SECRET_KEY'] = 'secret'

mysql = MySQL(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

# def send_mail(data):
#     """ Function to send emails.
#     """
#     with app.app_context():
#         msg = Message("Ping!",
#                     sender="admin.ping",
#                     recipients=[data['email']])
#         msg.body = data['message']
#   
#      mail.send(msg)
# @client.task
def sendPushNotification():
    try:
        webpush(
            subscription_info={"endpoint":"https://fcm.googleapis.com/fcm/send/cAbwWi2LlNI:APA91bEc7uFmwwea4K5IhanWMLih1oF5xyUEeas5e3Lcishedaqmu2rUNnH3YOmSJHT49OhHPDfrEQLRfx1vP_OCgEas2BQ4Hf9gvScz4912uI9blppw_0Zt09YqOic9vXgWQy7KQt_5",
                "expirationTime":"null",
                "keys":{"p256dh":"BDXMYM2A4te0we9G0RFbUaAcPYoHbq-RwTtq9mzlihKJtoLJtdzOlGGCXv7q92HhB1QqaHxoRTcmmP1GEWVE0MU","auth":"ICe4BCau0r1co0Ghsd7DxA"
            }},
            data="You have a task",
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
    except WebPushException as ex:
        print("I'm sorry, Dave, but I can't do that: {}", repr(ex))
        # Mozilla returns additional information in the body of the response.
        if ex.response and ex.response.json():
            extra = ex.response.json()
            print("Remote service replied with a {}:{}, {}",
                extra.code,
                extra.errno,
                extra.message
            )
    

def convertToBinaryData(filename):
    # Convert digital data to binary format
    with open(filename, 'rb') as file:
        binaryData = file.read()
    return binaryData

# USERS database

@app.route('/users/register', methods=['POST'])
def register():
    cur = mysql.connection.cursor()
    first_name = request.get_json()['first_name']
    last_name = request.get_json()['last_name']
    email = request.get_json()['email']
    password = bcrypt.generate_password_hash(request.get_json()['password']).decode('utf-8')
    created = datetime.utcnow()
	
    cur.execute("INSERT INTO users (first_name, last_name, email, password, created) VALUES ('" + 
		str(first_name) + "', '" + 
		str(last_name) + "', '" + 
		str(email) + "', '" + 
		str(password) + "', '" + 
		str(created) + "')")
    mysql.connection.commit()
	
    result = {
		'first_name' : first_name,
		'last_name' : last_name,
		'email' : email,
		'password' : password,
		'created' : created
	}

    return jsonify({'result' : result})
	

@app.route('/users/login', methods=['POST'])
def login():
    cur = mysql.connection.cursor()
    email = request.get_json()['email']
    password = request.get_json()['password']
    result = ""
	
    cur.execute("SELECT * FROM users where email = '" + str(email) + "'")
    rv = cur.fetchone()
	
    if bcrypt.check_password_hash(rv['password'], password):
        access_token = create_access_token(identity = rv)
        result = access_token
    else:
        result = jsonify({"error":"Invalid username and password"})
    
    return result

@app.route('/users/update/<userid>', methods=['PUT'])
def user_update(userid):
    cur = mysql.connection.cursor()
    first_name = request.get_json()['first_name']
    last_name = request.get_json()['last_name']

    cur.execute("UPDATE users SET first_name = '"+ str(first_name) + "', last_name = '" + str(last_name) + "' where id = " + userid)
    mysql.connection.commit()
    result = {'first_name':first_name, 'last_name': last_name}
    return jsonify({"result": result})

@app.route('/users/subscription/<userid>', methods=['PUT'])
def update_subscription(userid):
    cur = mysql.connection.cursor()
    subscription = request.get_json()['user_subscription']
    cur.execute("UPDATE users SET subscription = '" + subscription + "' where id = " + userid)
    mysql.connection.commit()
    result = {'status':subscription, 'userid': userid}
    return jsonify({"result": result})

# TODOS database

@app.route('/<userid>/api/tasks', methods=['GET'])
def get_all_tasks(userid):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM tasks where userid = "+ userid)
    rv = cur.fetchall()
    return jsonify(rv)


@app.route('/<userid>/api/task', methods=['POST'])
def add_task(userid):
    cur = mysql.connection.cursor()
    title = request.get_json()['title']
    reminder = request.get_json()['reminder']
    canvas = request.get_json()['canvas']
    cur.execute("INSERT INTO tasks (title, reminder, userid, canvas) VALUES ('" + str(title) + "', '" + str(reminder) + "', " + userid + ", '"+ str(canvas) +"')")
    mysql.connection.commit()
    result = {'title':title, 'reminder': reminder, 'canvas': canvas}

    return jsonify({"result": result})
    
@app.route("/<userid>/api/task/<id>", methods=['PUT'])
def update_task(userid, id):
    cur = mysql.connection.cursor()
    title = request.get_json()['title']
    reminder = request.get_json()['reminder']
    canvas = request.get_json()['canvas']
    cur.execute("UPDATE tasks SET title = '" + str(title) + "', reminder = '" + str(reminder) + "', canvas = '"+ str(canvas) +"' where id = " + id + " AND userid = "+ userid)
    mysql.connection.commit()

    result = {'title':title, 'reminder': reminder}

    return jsonify({"reuslt": result})


@app.route("/<userid>/api/task/<id>", methods=['DELETE'])
def delete_task(userid, id):
    cur = mysql.connection.cursor()
    response = cur.execute("DELETE FROM tasks where id = " + id + " AND userid = " + userid)
    mysql.connection.commit()

    if response > 0:
        result = {'message' : 'record deleted'}
    else:
        result = {'message' : 'no record found'}
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True)
