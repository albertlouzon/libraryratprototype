import '../styles/globals.css'
// add bootstrap css
import 'bootstrap/dist/css/bootstrap.css'
import {Head} from "next/document";

function MyApp({ Component, pageProps }) {
  return (
  <>

    <Component {...pageProps} />

  </>)
}

export default MyApp
