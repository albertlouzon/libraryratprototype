// posts will be populated at build time by getStaticProps()
import axios from "axios";
import TestImg from "./components/images/testImg";
import FileInput from "./components/FileInput";
import { useState } from 'react'
import Button from "./components/button";
import {useEntries} from "../lib/swr-hooks";
import {load} from "dotenv";
import {useRouter} from "next/router";

export default function NewEntryPage(props) {
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
    const [pw, setPw] = useState('')
    const [isAuth, setIsAuth] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    let [customers, setCustomers] = useState([])
    const entriesObject  = useEntries()

    async function selectFilePlease(e) {
        setLoading(true)
        if(!e.target.files || e.target.files.length === 0) {
            console.log('no files selected')
            return
        }
        const csv = e.target.files[0]
        const formData = new FormData()
        formData.append(csv.fileName, csv);

        try {
            const config = {
                headers: { 'content-type': 'multipart/form-data' },
                onUploadProgress: (event) => {
                    console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
                },
            };
            const res = await axios.post(`/api/dailyUsers`, csv);
            setLoading(false)
            setCustomers(res.data)
            console.log(res)

        } catch (e) {
            setLoading(false)
            console.error(e);
        }
    }



    function getRefs(meals) {
        const refs = []
        meals.forEach((meal) => {
            refs.push(meal.ref)
        })
        return refs
    }

    async function submitHandler(e) {
        console.log(customers)
        if(!e) {
            alert('no file')
            return
        }
        if(customers && customers.length === 0) {
            return
        }
        console.log("lijazjaz", customers)
        setSubmitting(true)
        e.preventDefault()
        const entries = entriesObject.entries ? entriesObject.entries[0] : []
        if(entries && entries.length > 0) {
            entries.forEach((e) => {
                if(customers.find(x => x.orderId === e.ORDER_ID)) {
                    console.log(`Ship ID ${customers.find(x => x.orderId === e.ORDER_ID).orderId} Already exists`)
                    setCustomers(customers.filter(x => x !== customers.find(x => x.orderId === e.ORDER_ID)))
                }
            })
        }
        if(!customers || customers.length === 0) {
            alert('No item in the file OR SHIP_ID ALREADY EXISTS IN DATABASE')
            return
        }
        for(const index in customers) {
            const customer = customers[index]
            const USER_ID = customer.userId
            const ORDER_ID = customer.orderId
            const FIRST_NAME = customer.firstName
            const NAME = customer.name
            const MEALS = getRefs(customer.meals)
            try {
                const res = await fetch('/api/create-entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        USER_ID,
                        ORDER_ID,
                        FIRST_NAME,
                        NAME,
                        MEALS,
                    }),
                })
                setSubmitting(false)
            } catch (e) {
                throw Error(e.message)
            }
        }

    }
    if(!isAuth) {
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
    }
        return (
            <div>
                <div>
                    <h2>Sélectionnez un fichier csv</h2>
                    <form  onSubmit={submitHandler}>
                        <label>
                            <input onChange={selectFilePlease} type="file" accept=".csv" name="name" />
                        </label>

                        <Button disabled={loading} type="submit">
                            {submitting ? 'Creating ...' : 'Create'}
                        </Button>
                    </form>
                </div>
            </div>
        )


}

