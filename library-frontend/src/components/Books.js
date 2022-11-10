import { useQuery } from '@apollo/client'
// import {  useState } from 'react'
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries'

const Books = ({genre, setGenre, show}) => {
  const result = useQuery(ALL_BOOKS)
 
  // eslint-disable-next-line no-unused-vars
  const { loading, error, data } = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: genre },
    skip: !genre,
 
  })

  if (!show) {
    return null
  }
   if (result.loading) {
     return null
   }
  
  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      <p>filter by genre</p>
      <div>
        <button onClick={() => setGenre('refactoring')}>refactoring</button>
        <button onClick={() => setGenre('agile')}>agile</button>
        <button onClick={() => setGenre('patterns')}>patterns</button>
        <button onClick={() => setGenre('design')}>design</button>
        <button onClick={() => setGenre('crime')}>crime</button>
        <button onClick={() => setGenre('classic')}>classic</button>
        <button onClick={() => setGenre('')}>all genres</button>
      </div>
      {loading || result.loading ? (
        <p>loading...</p>
      ) : (
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {data?.allBooks
              ? data?.allBooks.map(a => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
                ))
              : books.map(a => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Books
