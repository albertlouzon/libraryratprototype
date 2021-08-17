import Router, { useRouter } from 'next/router'

import { useEntry } from '../../lib/swr-hooks'
import Container from '../components/container'
import Nav from '../components/nav'
import Button from "../components/button";
import axios from "axios";

export default function EditEntryPage() {
  const router = useRouter()
  const id = router.query.id?.toString()
  const { data } = useEntry(id)

     function goToSemainier() {
        Router.push(`/semainier/${id}?meals=${data.MEALS}`)

    }

    if (data) {
    return (
      <>
        <Nav title="View" />
        <Container>
          <h1 className="font-bold text-3xl my-2">{data.USER_ID}</h1>
          <p>{data.ORDER_ID}</p>
          <p>{data.MEALS}</p>
            <Button onClick={goToSemainier}>Générer le semainier</Button>
        </Container>
      </>
    )
  } else {
    return (
      <>
        <Nav title="View" />
        <Container>
          <h1 className="font-bold text-3xl my-2">...</h1>
          <p>...</p>
        </Container>
      </>
    )
  }
}
