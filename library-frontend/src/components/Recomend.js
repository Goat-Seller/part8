import { useQuery } from '@apollo/client'
// import { useState } from 'react'
import { BOOKS_BY_GENRE, FAVORITE_GENRE } from '../queries'

const Books = props => {

  const user = useQuery(FAVORITE_GENRE)

  // eslint-disable-next-line no-unused-vars
  const {loading, error, data} = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: user?.data?.me?.favoriteGenre },
    skip: !user.data
  })

  if (!props.show ) {
    return null
  }

  const books = data?.allBooks
  if (!loading) {
    return (
      <div>
        <h2>Recomendation</h2>
        {/* <p>book about what you like: {fav}</p> */}
        <div>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>author</th>
                <th>published</th>
              </tr>
              {books?.map(a => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Books
