const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const http = require('http')

//subscription

const { execute, subscribe } = require('graphql')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

//

const jwt = require('jsonwebtoken')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const User = require('./models/User')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const mongoose = require('mongoose')

const MONGODB_URL =
  'mongodb+srv://fullstack:fullstack@cluster0.osluexu.mongodb.net/library?retryWrites=true&w=majority'

mongoose
  .connect(MONGODB_URL)
  .then(() => console.log('connecting to MongoDB'))
  .catch(e => console.log('error connecting to MongoDB'))

  // mongoose.set('debug', true)
const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodeToken = jwt.verify(auth.substring(7), JWT_SECRET)
        const currentUser = await User.findById(decodeToken.id)
        return { currentUser }
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })
  await server.start()

  server.applyMiddleware({
    app,
    path: '/',
  })
  const PORT = 4000
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

start()
