var assert = require('assert');
var fs = require('fs');
// var WebSocket = require('ws');
var io = require('socket.io-client');

var ConfigLoader = require('../api/ConfigLoader');
var TestUtils = require('./utils');

var configLoader = new ConfigLoader('app/config/config_test.yml');
var config = configLoader.load();

var utils = new TestUtils(config);

var pub = require('../api/RedisClient')({
  prefix: config.snc_redis.clients.default.options.prefix,
  url: config.snc_redis.clients.default.dsn
});

var initUsers = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
      utils.createUser('bill', ['ROLE_USER']),
      utils.createUser('sarah', ['ROLE_ADMIN']),
      utils.createUser('will', ['ROLE_RESTAURANT']),
    ])
    .then(function(users) {
      const [ bill, sarah, will ] = users
      utils
        .createRestaurant('foo', { latitude: 48.856613, longitude: 2.352222 })
        .then(restaurant => {
          will.addRestaurant(restaurant).then(() => {
            resolve()
          })
        })
    })
    .catch(function(e) {
      reject(e)
    })
  })
}

describe('Connect to Socket.IO', function() {

  before('Waiting for server', function() {
    this.timeout(30000)
    return new Promise(function (resolve, reject) {
      utils.waitServerUp('127.0.0.1', 8001).then(function() {
        resolve()
      })
    })
  })

  beforeEach('Cleaning db & initializing users', function() {
    this.timeout(30000)
    return new Promise(function (resolve, reject) {
      utils.cleanDb()
        .then(function() {
          initUsers().then(function() {
            resolve()
          })
        })
    })
  })

  it('should return authentication error without JWT', function() {
    return new Promise(function (resolve, reject) {

      var socket = io.connect('http://127.0.0.1:8001', {
        path: '/tracking/socket.io',
        forceNew: true,
        transports: ['websocket'],
      });

      socket.on('error', (error) => {
        assert.equal('Authentication error', error);
        resolve();
      });

    })
  })

  it('should connect successfully with valid JWT', function() {

    return new Promise(function (resolve, reject) {

      var token = utils.createJWT('bill');

      var socket = io.connect('http://127.0.0.1:8001', {
        path: '/tracking/socket.io',
        forceNew: true,
        transports: ['websocket'],
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      })

      socket.on('connect', function() {
        resolve();
      })

    })
  })

  it('should emit "order:created" message to user with role ROLE_ADMIN', function() {

    return new Promise(function (resolve, reject) {

      utils.db.Restaurant.findOne({
        where: { name: 'foo' }
      }).then(restaurant => {

        var token = utils.createJWT('sarah');

        var socket = io.connect('http://127.0.0.1:8001', {
          path: '/tracking/socket.io',
          forceNew: true,
          transports: ['websocket'],
          extraHeaders: {
            Authorization: `Bearer ${token}`
          }
        })

        var order = {
          customer: 'bill',
          restaurant: {
            id: restaurant.get('id')
          },
        }

        socket.on('connect', function() {
          pub.prefixedPublish('order:created', JSON.stringify(order))
        })

        socket.on('order:created', function(message) {
          assert.deepEqual(order, message);
          resolve();
        })

      })

    })
  })

  it('should emit "order:created" message to user with role ROLE_RESTAURANT', function() {

    this.timeout(3000)

    return new Promise(function (resolve, reject) {

      utils.db.Restaurant.findOne({
        where: { name: 'foo' }
      }).then(restaurant => {

        var token = utils.createJWT('will');

        var socket = io.connect('http://127.0.0.1:8001', {
          path: '/tracking/socket.io',
          forceNew: true,
          transports: ['websocket'],
          extraHeaders: {
            Authorization: `Bearer ${token}`
          }
        })

        var order = {
          customer: 'bill',
          restaurant: {
            id: restaurant.get('id')
          },
        }

        socket.on('connect', function() {
          // Let some time for client to join room (because of database)
          setTimeout(() => pub.prefixedPublish('order:created', JSON.stringify(order)), 750)
        })

        socket.on('order:created', function(message) {
          assert.deepEqual(order, message);
          resolve();
        })

      })

    })
  })

  it('should not emit "order:created" message to user with role ROLE_USER', function() {

    this.timeout(2000)

    return new Promise(function (resolve, reject) {

      var token = utils.createJWT('bill');

      var socket = io.connect('http://127.0.0.1:8001', {
        path: '/tracking/socket.io',
        forceNew: true,
        transports: ['websocket'],
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      })

      var order = {
        customer: 'bill',
        restaurant: {
          id: 1
        }
      }

      socket.on('connect', function() {
        pub.prefixedPublish('order:created', JSON.stringify(order))
        setTimeout(resolve, 1500)
      });

      socket.on('order:created', function(message) {
        reject(new Error('This event should not have been emitted'));
      })

    })
  })

});
