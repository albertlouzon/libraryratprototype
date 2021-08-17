const puppeteer = require('puppeteer')
const url = require("url");

const handler = async (req, res) => {
    var url = req.body.url

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url );
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
                deviceScaleFactor: window.devicePixelRatio,
            };
        });
        const pdf = await page.pdf({ format: 'A4' });

        await browser.close();
        res.status(200).json(pdf)

    } catch (e) {
        res.status(500).json({ message: e.message })
    }
}


export default handler
