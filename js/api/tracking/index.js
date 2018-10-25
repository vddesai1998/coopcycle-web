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
    // accessControl: 'admins'
  },
  'offline': {
    toJSON: false,
    psubscribe: false,
    // accessControl: 'admins'
  },
  'tracking': {
    toJSON: true,
    psubscribe: false,
    // accessControl: 'admins'
  },
  'task:done': {
    toJSON: true,
    psubscribe: false,
    // accessControl: 'admins'
  },
  'task:failed': {
    toJSON: true,
    psubscribe: false,
    // accessControl: 'admins'
  },
  'task:created': {
    toJSON: true,
    psubscribe: false
  },
  'task:cancelled': {
    toJSON: true,
    psubscribe: false
  },
  'restaurant:*:orders': {
    toJSON: true,
    psubscribe: true
    // TODO
    // Forward to
  },
  'order:*:events': {
    toJSON: true,
    psubscribe: true
    // TODO
    // Forward to admins + restaurant owner + customer
  },
  'user:*:notifications': {
    toJSON: true,
    psubscribe: true
  },
  'user:*:notifications:count': {
    toJSON: true,
    psubscribe: true
  },
  'order:created': {
    toJSON: true,
    psubscribe: false,
    // TODO
    // Forward to admins + restaurant owner
  }
}

sub.on('subscribe', (channel, count) => {
  winston.info(`Subscribed to ${channel} (${count})`)
  if (count === _.size(channels)) {
    winston.info('Subscribed to all channels!');
    server.listen(process.env.PORT || 8001);
  }
})

sub.on('psubscribe', (channel, count) => {
  winston.info(`Subscribed to ${channel} (${count})`)
  if (count === _.size(channels)) {
    winston.info('Subscribed to all channels!');
    server.listen(process.env.PORT || 8001);
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

io
.use(function(socket, next) {

  console.log('SOCKET HANDSHAKE')

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
})
.on('connect', function (socket) {

  console.log('socket.id', socket.id)
  console.log('socket.user', socket.user.toJSON())

  // TODO
  // When ROLE_RESTAURANT, load managed restaurants

  // Add admins to dedicated room
  if (_.includes(socket.user.roles, 'ROLE_ADMIN')) {
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

  // console.log(io.sockets.sockets)

    //

  sub.on('message', function(channelWithPrefix, message) {

    winston.debug(`Received message on channel ${channelWithPrefix}`)

    const channel = sub.unprefixedChannel(channelWithPrefix)
    const { toJSON } = channels[channel]

    // console.log('io.sockets', io.sockets)

    io.in('admins').clients((err, clients) => {
      console.log('clients in room admins', clients);
    });

    // Send event to room "admins"
    io.in('admins').emit(channel, toJSON ? JSON.parse(message) : message);

    // io.sockets.emit(channel, toJSON ? JSON.parse(message) : message)

  })

  sub.on('pmessage', function(patternWithPrefix, channelWithPrefix, message) {

    winston.debug(`Received pmessage on channel ${channelWithPrefix}`)

    const channel = sub.unprefixedChannel(channelWithPrefix)
    const pattern = sub.unprefixedChannel(patternWithPrefix)
    const { toJSON } = channels[pattern]

    io.sockets.emit(channel, toJSON ? JSON.parse(message) : message)

  })

})
