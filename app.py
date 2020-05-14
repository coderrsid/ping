from flask import Flask, jsonify, request, json, Response, render_template
from flask_mysqldb import MySQL
from datetime import datetime
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)
from pywebpush import webpush, WebPushException
from celery import Celery

app = Flask(__name__)
app.secret_key = 'SECRET KEY'

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

app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

@celery.task
def sendPushNotification(user, title):
    try:
        webpush(
            subscription_info=json.loads(user['subscription']),
            data="Task : "+str(title),
            vapid_private_key="./private_key.pem",
            vapid_claims={
                "sub": "mailto:"+str(user['email']),
            }
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

def calculatedDuration(time1, time2):
    timedelta = time2 - time1
    return int(timedelta.total_seconds())

def pushTask(userid, taskid):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users where id = "+ userid)
    rv = cur.fetchone()
    cur.execute("SELECT * FROM tasks where id = "+ taskid +" AND userid = " + userid)
    task = cur.fetchone()

    current_time = datetime.now()
    task_time = task["reminder"].replace("T", " ")
    reminder_time = datetime.strptime(task_time, '%Y-%m-%d %H:%M')
    calculated_time = calculatedDuration(reminder_time, current_time)
    print(str(calculated_time))
    sendPushNotification.apply_async((rv, task['title']), countdown=calculated_time)


# CRUD - USERS database

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
    return jsonify({'first_name':first_name, 'last_name': last_name})

@app.route('/users/subscription/<userid>', methods=['PUT'])
def update_subscription(userid):
    cur = mysql.connection.cursor()
    subscriptionId = request.get_json()['subscription']
    cur.execute("UPDATE users SET subscription = '" + str(subscriptionId) + "' where id = " + userid)
    mysql.connection.commit()
    result = {'status':subscription, 'userid': userid}
    return jsonify({"result": result})

# CRUD - TODOS database

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
    pushTask(userid, id)
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
