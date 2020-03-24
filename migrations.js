'use strict'

const express = require('express')
const mysql = require('mysql')

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "covid"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database connected')
})

const createAdminTable = () => {
    let sql = `
    create table admin (
        id int unsigned auto_increment primary key,
        username varchar(100) not null,
        password varchar(255) not null,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp null on update current_timestamp
    )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table books has been created!')
    })
}

const createUsersTable = () => {
    let sql = `
        create table users (
            id int unsigned auto_increment primary key,
            username varchar(100) not null,
            password varchar(255) not null,
            created_at timestamp default current_timestamp,
            updated_at timestamp default current_timestamp null on update current_timestamp
        )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table users has been created!')
    })
}

const createRujukanTable = () => {
    let sql = `
    create table rujukan (
        id int unsigned auto_increment primary key,
        Nama varchar(100) not null,
        Alamat varchar(255) not null,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp null on update current_timestamp
    )
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        console.log('Table user_book has been created!')
    })
}

createAdminTable()
createUsersTable()
createRujukanTable()
