from flask import Flask, jsonify, request, json
from flask_mysqldb import MySQL
from datetime import datetime
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_jwt_extended import (create_access_token)

app = Flask(__name__)

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
    cur.execute("INSERT INTO tasks (title, reminder, userid) VALUES ('" + str(title) + "', '" + str(reminder) + "', " + userid + ")")
    mysql.connection.commit()
    result = {'title':title, 'reminder': reminder}

    return jsonify({"result": result})

@app.route("/<userid>/api/task/<id>", methods=['PUT'])
def update_task(userid, id):
    cur = mysql.connection.cursor()
    title = request.get_json()['title']
    reminder = request.get_json()['reminder']
    cur.execute("UPDATE tasks SET title = '" + str(title) + "', reminder = '" + str(reminder) + "' where id = " + id + " AND userid = "+ userid)
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

# Canvas route
'''
@app.route('/api/task/canvas/<id>', methods=['POST', 'DELETE'])
def post_canvas(id):
    cur = mysql.connection.cursor()

    if request.method == "POST":
        canvas = request.get_json()['canvas']
        canvasBlob = convertToBinaryData(canvas)
        query = ("UPDATE tasks SET canvas = %s where id = %s")
        args = (canvasBlob, id)
        cur.execute(query, args)
        mysql.connection.commit()
        result = "Canvas upload successfully"

    if request.method == "DELETE":
        canvasBlob = ""
        query = "UPDATE tasks SET canvas = %s where id = %s"
        args = (canvasBlob, id)
        cur.execute(query, args)
        mysql.connection.commit()
        result = "Canvas deleted successfully"

    return jsonify({"result": result})

'''
if __name__ == '__main__':
    app.run(debug=True)
