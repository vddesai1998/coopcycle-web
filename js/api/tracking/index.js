var path = require('path');
var _ = require('lodash');
var http = require('http');
var fs = require('fs');
var jwt = require('jsonwebtoken');

const TokenVerifier = require('../TokenVerifier')

var winston = require('winston')
winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

var ROOT_DIR = __dirname + '/../../..';

console.log('---------------------');
console.log('- STARTING TRACKING -');
console.log('---------------------');

console.log('NODE_ENV = ' + process.env.NODE_ENV);
console.log('PORT = ' + process.env.PORT);

const {
  sub,
  sequelize
} = require('./config')(ROOT_DIR)

const db = require('../Db')(sequelize)

const server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
// server.listen(process.env.PORT || 8001);

const cert = fs.readFileSync(ROOT_DIR + '/var/jwt/public.pem')
const tokenVerifier = new TokenVerifier(cert, db)

const io = require('socket.io')(server, { path: '/tracking/socket.io' });

let subscribed = false;

const channels = {
  'online': {
    toJSON: false,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'offline': {
    toJSON: false,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'tracking': {
    toJSON: true,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'task:done': {
    toJSON: true,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'task:failed': {
    toJSON: true,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'task:created': {
    toJSON: true,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'task:cancelled': {
    toJSON: true,
    psubscribe: false,
    rooms: (message) => ['admins'],
  },
  'restaurant:*:orders': {
    toJSON: true,
    psubscribe: true,
    rooms: (message) => ['admins', `restaurants:${message.restaurant.id}`],
  },
  'order:*:events': {
    toJSON: true,
    psubscribe: true,
    // TODO Send to admins, restaurant owners & customer
    rooms: (message) => ['admins'],
  },
  // 'user:*:notifications': {
  //   toJSON: true,
  //   psubscribe: true
  // },
  // 'user:*:notifications:count': {
  //   toJSON: true,
  //   psubscribe: true
  // },
  'order:created': {
    toJSON: true,
    psubscribe: false,
    rooms: (message) => ['admins', `restaurants:${message.restaurant.id}`]
  }
}

sub.on('subscribe', (channel, count) => {
  winston.info(`Subscribed to ${channel} (${count})`)
  if (count === _.size(channels)) {
    winston.info('Subscribed to all channels!');
    initialize()
  }
})

sub.on('psubscribe', (channel, count) => {
  winston.info(`Subscribed to ${channel} (${count})`)
  if (count === _.size(channels)) {
    winston.info('Subscribed to all channels!');
    initialize()
  }
})

winston.info('Subscribing to Redis channels…');
_.each(channels, (options, channel) => {
  const { psubscribe } = options
  if (psubscribe) {
    sub.prefixedPSubscribe(channel)
  } else {
    sub.prefixedSubscribe(channel)
  }
})

const authMiddleware = function(socket, next) {

  // @see https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections

  if (socket.handshake.headers && socket.handshake.headers.authorization) {

    tokenVerifier.verify(socket.handshake.headers)
      .then(user => {
        socket.user = user;
        next();
      })
      .catch(e => next(new Error('Authentication error')))

    // jwt.verify(socket.handshake.headers.authorization, cert, function(err, decoded) {
    //   if (err) return next(new Error('Authentication error'));
    //   socket.decoded = decoded;
    //   next();
    // });

  } else {
    next(new Error('Authentication error'));
  }
}

function hasRole(user, role) {
  return _.includes(user.roles, role)
}

function initialize() {

  sub.on('message', function(channelWithPrefix, message) {

    winston.debug(`Received message on channel ${channelWithPrefix}`)

    const channel = sub.unprefixedChannel(channelWithPrefix)
    const { toJSON, rooms } = channels[channel]

    message = toJSON ? JSON.parse(message) : message

    // io.sockets.emit(channel, toJSON ? JSON.parse(message) : message)
    rooms(message).forEach(room => io.in(room).emit(channel, message))

  })

  sub.on('pmessage', function(patternWithPrefix, channelWithPrefix, message) {

    winston.debug(`Received pmessage on channel ${channelWithPrefix}`)

    const channel = sub.unprefixedChannel(channelWithPrefix)
    const pattern = sub.unprefixedChannel(patternWithPrefix)
    const { toJSON, rooms } = channels[pattern]

    message = toJSON ? JSON.parse(message) : message

    // io.sockets.emit(channel, toJSON ? JSON.parse(message) : message)
    rooms(message).forEach(room => io.in(room).emit(channel, message))

  })

  io
    .use(authMiddleware)
    .on('connect', function (socket) {

      console.log('socket.id', socket.id)
      console.log('socket.user', socket.user.toJSON())

      // When ROLE_RESTAURANT, load managed restaurants
      if (hasRole(socket.user, 'ROLE_RESTAURANT')) {
        socket.user.getRestaurants()
          .then(restaurants => restaurants.map(restaurant => `restaurants:${restaurant.get('id')}`))
          .then(rooms => {
            rooms.forEach(room => {
              socket.join(room, (err) => {
                if (!err) {
                  console.log(`user "${socket.user.username}" joined room "${room}"`)
                }
              })
            })
          })
      }

      // Add admins to dedicated room
      if (hasRole(socket.user, 'ROLE_ADMIN')) {
        socket.join('admins', (err) => {
          if (!err) {
            console.log(`user "${socket.user.username}" joined room "admins"`)
          }
        })
      }

      // @see https://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients
      // @see https://socket.io/docs/emit-cheatsheet/
      // io.clients((error, clients) => {
      //   // if (error) throw error;
      //   console.log('clients', clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
      //   clients.forEach((id) => {
      //     io.in(id)
      //   })
      // });

    })

  server.listen(process.env.PORT || 8001);

}
