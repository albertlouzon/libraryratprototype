import Skeleton from 'react-loading-skeleton'

import Nav from './components/nav'
import Container from './components/container'
import Entries from './components/entries'

import { useEntries } from '..//lib/swr-hooks'
import axios from "axios";
import Button from "./components/button";
import {useState} from "react";
import {useRouter} from "next/router";

export default function IndexPage() {
    async function auth() {
            try {
                const res = await axios.post(`/api/password`, {pw});
                setIsAuth(true)
            } catch (e) {
                console.log('error', e)
                setIsAuth(false)
                alert('nope')
            }
    }
    const router = useRouter()
    const { entries, isLoading } = useEntries()
    const [pw, setPw] = useState('')
    const [isAuth, setIsAuth] = useState(true)
    const isPwStored =  router?.query?.password && router?.query?.password !==  process.env.SECRET_KEY
    if(!isAuth && !isPwStored) {
        return (
            <div >
                <input
                    id="password"
                    className="shadow border rounded w-full"
                    type="password"
                    name="password"
                    value={pw}
                    onChange={(e) => {
                        e.preventDefault();
                        setPw(e.target.value)
                    }}
                />
                <button onClick={auth}>
                    Entrer
                </button>

            </div>
        )
    } else if (!isLoading) {
      return (
          <div>
              <Nav />
              <Container>
                  <Entries entries={entries} />
              </Container>
          </div>
      )
  }
    return (
        <div>
            <Nav />
            <Container>
                <Skeleton width={180} height={24} />
                <Skeleton height={48} />
                <div className="my-4" />
                <Skeleton width={180} height={24} />
                <Skeleton height={48} />
                <div className="my-4" />
                <Skeleton width={180} height={24} />
                <Skeleton height={48} />
            </Container>
        </div>
    )

}
