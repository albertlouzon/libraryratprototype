import { NextApiHandler } from 'next'
import Filter from 'bad-words'
import { query } from '../../lib/db'

const filter = new Filter()

const handler = async (req, res) => {
  const { USER_ID, ORDER_ID, FIRST_NAME, NAME, MEALS } = req.body
  try {
    if (!USER_ID  || !ORDER_ID  || !FIRST_NAME  || !NAME  || !MEALS) {
      return res
        .status(400)
        .json({ message: 'missing elements` are required' })
    }

    const results = await query(
      `
      INSERT INTO SEMAINIERS (USER_ID, ORDER_ID, FIRST_NAME, NAME, MEALS)
      VALUES (?, ?, ?, ?, ?)
      `,
      [filter.clean(USER_ID), filter.clean(ORDER_ID), filter.clean(FIRST_NAME), filter.clean(NAME), filter.clean(JSON.stringify(MEALS))]
    )

    return res.json('yihaaa', results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
