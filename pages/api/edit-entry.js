import { NextApiHandler } from 'next'
import Filter from 'bad-words'
import { query } from '../../lib/db'

const filter = new Filter()

const handler = async (req, res) => {
  const { id, USER_ID, ORDER_ID, FIRST_NAME, NAME, MEALS } = req.body
  try {
    if (!USER_ID || !ORDER_ID || !MEALS) {
      return res
        .status(400)
        .json({ message: '`USER_ID`,`title`, and `USER_ID` are all required && MEALS' })
    }

    const results = await query(
      `
      UPDATE SEMAINIERS
      SET USER_ID = ?, ORDER_ID = ?,  FIRST_NAME = ?,  NAME = ?,  MEALS = ?,
      WHERE id = ?
      `,
      [filter.clean(USER_ID), filter.clean(ORDER_ID),filter.clean(FIRST_NAME),filter.clean(NAME),filter.clean(MEALS), id]
    )

    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
