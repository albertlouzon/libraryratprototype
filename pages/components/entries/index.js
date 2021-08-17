import Entry from './entry'
import axios from "axios";

function Entries({ entries }) {
  if (entries) {


      return (
      <table>
        <thead>
        <tr>
          <th>Prenom</th>
          <th>Nom</th>
          <th>User ID</th>
          <th>Order ID</th>
          <th>URL Semainier</th>
        </tr>
        </thead>
        <tbody>
        {entries[0].map((e) => (
            <tr>
              <Entry id={e.id} USER_ID={e.USER_ID} ORDER_ID={e.ORDER_ID} FIRST_NAME={e.FIRST_NAME} NAME={e.NAME} MEALS={e.MEALS}/>
            </tr>

        ))}
        </tbody>

      </table>
    )
  } else {
    return null
  }
}

export default Entries
