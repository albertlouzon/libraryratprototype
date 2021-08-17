import { useState } from 'react'
import Link from 'next/link'
import { mutate } from 'swr'

import ButtonLink from '../../button-link'
import Button from '../../..//components/button'

function Entry({ id, USER_ID, ORDER_ID, FIRST_NAME, NAME, MEALS }) {
  const [deleting, setDeleting] = useState(false)

  async function deleteEntry() {
    setDeleting(true)
    let res = await fetch(`/api/delete-entry?id=${id}`, { method: 'DELETE' })
    let json = await res.json()
    if (!res.ok) throw Error(json.message)
    mutate('/api/get-entries')
    setDeleting(false)
  }
  return (
      <>
        <td>
          <Link href={`/entry/${id}`} >
            <a className="font-bold py-2">{FIRST_NAME}</a>
          </Link>
        </td>
        <td>
          <Link href={`/entry/${id}`} >
            <a className="font-bold py-2">{NAME}</a>
          </Link>
        </td>
      <td>
        <Link href={`/entry/${id}`}>
        <a className="font-bold py-2">{USER_ID}</a>
      </Link>
      </td>

        <td>
          <div >
            <span className="font-bold py-2">{ORDER_ID}</span>
          </div>
        </td>

        <td>

          <Link href={`/semainier/${id}`} className="mb-5 mt-5">
            <a className="font-bold py-2" target="_blank">{`https://semainier.qilibri.fr/semainier/${id}?order-id=${ORDER_ID}`}</a>
          </Link>
        </td>
      </>

  )
}

export default Entry
