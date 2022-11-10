import { useEffect, useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recomend from './components/Recomend'

import { ALL_BOOKS, BOOK_ADDED, BOOKS_BY_GENRE } from './queries'

export const updateCache = (cache, query, addedBook) => {
  const uniqByTitle = a => {
    let seen = new Set()
    return a.filter(item => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')
  const [genre, setGenre] = useState('')
  const client = useApolloClient()
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded

      window.alert(`${addedBook.title} added`)

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
      if(genre){updateCache(
        client.cache,
        { query: BOOKS_BY_GENRE, variables: { genre: genre } },
        addedBook
      )}
    },
  })

  useEffect(() => {
    if (token === '') {
      setToken(localStorage.getItem('user-token'))
    }
  }, [token])

  const logout = () => {
    localStorage.clear()
    setToken('')
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recomend')}>recomend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>
      <Recomend show={page === 'recomend'} />
      <LoginForm
        setPage={setPage}
        setToken={setToken}
        show={page === 'login'}
      />
      <Authors show={page === 'authors'} />
      <Books genre={genre} setGenre={setGenre} show={page === 'books'} />
      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
