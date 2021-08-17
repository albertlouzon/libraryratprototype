
const handler = async (req, res) => {
    var pw = req.body['pw']
    if(pw === process.env.SECRET_KEY) {
        res.status(200).json('success !')
    } else {
        res.status(401).json({ message: 'Non autorisé'})
    }
}


export default handler
