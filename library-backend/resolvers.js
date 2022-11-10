const { UserInputError, AuthenticationError } = require('apollo-server')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const jwt = require('jsonwebtoken')

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        const books = Book.find({ author: { $in: author } })
        books.find({ genres: { $in: args.genre } })
        return books
      } else if (args.author) {
        const author = await Author.findOne({ name: args.author })
        const books = await Book.find({ author: { $in: author } })
        return books
      } else if (args.genre) {
        return Book.find({ genres: { $in: args.genre } })
      } else {
        return Book.find({})
      }
    },
    allAuthors: async root =>
      await Author.find({}).populate({
        path: 'bookCount',
        select: 'title author',
      }),
    me: async (root, args, context) => context.currentUser,
  },
  Book: {
    author: async root => {
      try {
        const author = await Author.findById(root.author)
        return author
      } catch (err) {
        throw new Error(err)
      }
    },
  },
  Author: {
    // bookCount: async root => {
    //   const author = await Author.findOne({ _id: root })
    //   const bookCount = await Book.find({
    //     author: { $in: author },
    //   }).countDocuments()
    //   return bookCount
    // },
  },
  Mutation: {
    addAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const author = new Author({ ...args })
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
      return author
    },
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const author = await Author.findOne({ name: args.author })
      const book = new Book({ ...args, author: author })
      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.born
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })

      return user.save().catch(error => {
        throw new UserInputError(error.message, { invalidArgs: args })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }
      const userForToken = { username: args.username, id: user._id }
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}
module.exports = resolvers
