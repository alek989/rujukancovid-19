const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()
const secretKey = 'thisisverysecretkey'
const adminKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "covid-19"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

/************** JWT USER ***************/
const isAuthorized = (request, result, next) => {
    if (typeof(request.headers['user-auth']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token Invalid'
        })
    }

    let token = request.headers['user-auth']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token Invalid'
            })
        }
    })

    next()
}

/************** HOMEPAGE ***************/
app.get('/', (request, result) => {
    result.json({
        success: true,
        message: 'Its Corona Time'
    })
})

/************** REGISTER USER ***************/
app.post('/register/user', (request, result) => {
    let data = request.body

    let sql = `
        insert into users (username, password)
        values ('`+data.username+`', '`+data.password+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Your Account Succesfully Registered!'
    })
})


/************** LOGIN USER ***************/
app.post('/login', function(request, result) {
  let data = request.body
	var username = data.username;
	var password = data.password;
	if (username && password) {
		db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.username + '|' +data.password, secretKey)
        result.json({
          success: true,
          message: 'Logged In',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Invalid Credential!',
        });
			}
			result.end();
		});
	}
});

/************** GET RUANG ***************/
app.get('/ruang', isAuthorized, (req, res) => {
    let sql = `
        select * from ruang
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Ini list ruangnya',
            data: result
        })
    })
})

/************** GET RUANG  ID ***************/
app.get('/ruang/tmp/:id', isAuthorized, (req, res) => {
    let sql = `
        select * from ruang
        where id_ruang = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Ruang detail",
            data: result[0]
        })
    })
})

/************** BOOK RUANG ***************/
app.post('/ruang/book/:id', isAuthorized, (req, res) => {
    let data = req.body

    db.query(`
        insert into transaksi (id_users, id_ruang)
        values ('`+data.id_users+`', '`+req.params.id+`')
    `, (err, result) => {
        if (err) throw err
    })

    db.query(`
        update ruang
        set status = 'Terpakai'
        where id_ruang = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Berhasil!"
    })
})





/************** JWT ADMIN ***************/
const adminAuth = (request, result, next) => {
    if (typeof(request.headers['admin-auth']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Unauthorized. Token Is Not Provided Or Invalid'
        })
    }

    let token = request.headers['admin-auth']

    jwt.verify(token, adminKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Unauthorized. Token Is Not Provided Or Invalid'
            })
        }
    })

    next()
}

/************** LOGIN ADMIN ***************/
app.post('/adm/login', function(request, result) {
  let data = request.body
	var username = data.username;
	var password = data.password;
	if (username && password) {
		db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.username + '|' +data.password, adminKey)
        result.json({
          success: true,
          message: 'Logged In',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Invalid Credential!',
        });
			}
			result.end();
		});
	}
});

/************** CRUD ADMIN ***************/
app.get('/adm/ruang', adminAuth, (req, res) => {
    let sql = `
        select * from ruang
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Ruaaaangggggan',
            data: result
        })
    })
})

/************** GET RUANG ID ***************/
app.get('/adm/ruang/:id', adminAuth, (req, res) => {
    let sql = `
        select * from ruang
        where id_ruang = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Ruangan",
            data: result[0]
        })
    })
})

/************** ADD RUANG ***************/
app.post('/adm/ruang/add', adminAuth, (request, result) => {
    let data = request.body

    let sql = `
        insert into ruang ( nama, status)
        values ('`+data.nama+`', '`+data.status+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Ruang berhasil ditambahkan!'
    })
})

/************** EMPTY RUANG ***************/
app.post('/adm/ruang/:id/kosong', adminAuth, (req, res) => {
    let data = req.body

    db.query(`
      update ruang
      set status = 'kosong'
      where id_ruang = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Ruangan Kosong"
    })
})

/************** UPDATE RUANG ***************/
app.put('/adm/ruang/:id', adminAuth, (request, result) => {
    let data = request.body

    let sql = `
        update ruang
        set nama = '`+data.nama+`', status = '`+data.status+`'
        where id_ruang = `+request.params.id+`
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Ruangan ter-apdet gan!'
    })
})

/************** GET ALL USERS ***************/
app.get('/adm/users', adminAuth, (req, res) => {
    let sql = `
        select * from users
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Success retrieve data from database',
            data: result
        })
    })
})

/************** TRANSAKSI INI ***************/
app.get('/adm/transaksi/all', adminAuth, (req, res) => {
    let sql = `
        select * from transaksi
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Data Transaksi',
            data: result
        })
    })
})

/************** GET TRANSAKSI BY ID ***************/
app.get('/adm/transaction/:id', adminAuth, (req, res) => {
    let sql = `
        select * from transaksi
        where id_transaksi = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Horay",
            data: result[0]
        })
    })
})

/************** GET TRANSACTION BY USER's ID ***************/
app.get('/adm/usr/:id/trs', adminAuth, (req, res) => {
    db.query(`
        select transaction.id_ts, room.id_room, patient.id_patient
        from user
        right join transaction on user.id_user = transaction.id_user
        right join room on transaction.id_room = room.id_room
        right join patient on transaction.id_patient = patient.id_patient
        where user.id_user = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err

        res.json({
            message: "Getting Transaction Success!",
            data: result
        })
    })
})


/************** DELETE RUANG BY ID ***************/
app.delete('/adm/ruang/:id/delete', adminAuth, (request, result) => {
    let sql = `
        delete from ruang where id_ruang = `+request.params.id+`
    `

    db.query(sql, (err, res) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Ruangan sudah tidak layak, mangkanya dihapus!'
    })
})


/************** PORT ***************/
app.listen(1337, () => {
    console.log('App is running on port 1337!')
})