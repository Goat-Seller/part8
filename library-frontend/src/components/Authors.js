import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { UPDATE_AUTHOR, ALL_AUTHORS } from '../queries'

const Authors = props => {
  const [name, setName] = useState('')
  let [born, setBorn] = useState('')
  const result = useQuery(ALL_AUTHORS)
  const [changeNumber] = useMutation(UPDATE_AUTHOR)

  if (!props.show) {
    return null
  }
  if (result.loading) {
    return <div>loading...</div>
  }
  const authors = result.data.allAuthors

  const submit = async e => {
    e.preventDefault()
    console.log(name);
    
    born = parseInt(born)
    await changeNumber({ variables: { name, born } })
    setBorn('')
    setName('')
  }

  
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
       
        </tbody>
      </table>
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          <div>
            <select  onChange={({target}) => setName(target.value)} >
              {authors.map(a => <option key={a.id} value={a.name} >{a.name}</option> )}
            </select>
            <p>Selected name is: {name}</p>
          </div>
          <div>
            <label>born</label>
            <input
              type='number'
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
