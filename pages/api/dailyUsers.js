var papa = require('papaparse')
var axios = require('axios')
const fs = require('fs')
var cors = require("cors");
var express = require("express");

// Server initialization

var corsOptions = {
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

import nextConnect from 'next-connect';

const apiRoute = nextConnect({
    onError(error, req, res) {
        res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
    },

    // Handle any other HTTP method
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});
apiRoute.use(cors(corsOptions));
apiRoute.use(express.static('public'));

apiRoute.use('/public', express.static(process.cwd() + '/public'));
apiRoute.use(express.static(process.cwd() + '/public'));


apiRoute.post(async (request, respond) => {
    if (request.method === 'POST') {
        // Process a POST request
        var body = '';
        const filePath = process.cwd() + `/public/data${Math.random()}.csv`;
        await request.on('data', function (data) {
            console.log('data detected')
            body += data;
        });
        console.log('it went here')

        request.on('end', function () {
            console.log('pretty good')
            fs.appendFile(filePath, body, async function () {
                console.log('ALL GOOD')
                const res =     await getUsers(filePath);
                respond.status(200).send(res)
            });
        });
    }});



// logic

let allMeals = []
const trads = { restrictions: {}, recipes: {} }
const ingredients = {
    porc: false,
    poulet: false,
    poivrons: false,
    tomates: false,
    fromage: false,
    riz: false,
    boeuf: false,
    'pommes de terre': false,
    chocolat: false,
    légumineuse: false,
    champignon: false,
    oignon: false,
    olives: false,
    carotte: false,
    maïs: false,
    quinoa: false,
    boulgour: false,
    pâtes: false
}

const allergens = {
    lait: false,
    gluten: false,
    soja: false,
    arachides: false,
    'fruits à coque': false,
    poisson: false,
    'fruits de mer': false
}

const papaConfig = {
    delimiter: "",	// auto-detect
    newline: "",	// auto-detect
    quoteChar: '"',
    escapeChar: '"',
    header: true,
    transformHeader: undefined,
    dynamicTyping: false,
    preview: 0,
    encoding: "",
    worker: false,
    comments: false,
    step: undefined,
    complete: undefined,
    error: undefined,
    download: false,
    downloadRequestHeaders: undefined,
    downloadRequestBody: undefined,
    skipEmptyLines: false,
    chunk: undefined,
    chunkSize: undefined,
    fastMode: undefined,
    beforeFirstChunk: undefined,
    withCredentials: undefined,
    transform: undefined,
    delimitersToGuess: [',', '\t', '|', ';', papa.RECORD_SEP, papa.UNIT_SEP]
}
const getUsers = async  (path) => {
    const p = fs.promises
    const res = await p.readFile(path, 'utf8')
    const csv = papa.parse(res, papaConfig).data
    await getAllMeals().then((res) => allMeals = res)
    const formattedCsv = await orderByCustomerId(csv)
    let payload = []
    for (let i = 0; i <= formattedCsv.length - 1; i++) {
        const user = formattedCsv[i]
        if(user) {
            const ref = Object.values(user).find(x => Array.isArray(x))
            if(ref) {
                payload.push({
                    userId: user['userId'],
                    orderId: Object.keys(user).find(x => Array.isArray(user[x])),
                    meals: findMealsForRefs(ref),
                    firstName: user['PRENOM'] ? user['PRENOM'] : 'no nickname ?',
                    name: user['NOM'] ? user['NOM']  : 'no name ?'
                })
            }
        }

    }

    return payload
}

const findMealsForRefs = function (arrayOfRefs) {
    const res = []
    arrayOfRefs.forEach((ref) => {
        if(allMeals.find(meal => meal.ref.toLowerCase() === ref.toLowerCase())) {
            res.push(allMeals.find(meal => meal.ref.toLowerCase() === ref.toLowerCase() ))
        } else {
            console.error('could not find ref', ref)
        }
    })
    return res
}

const orderByCustomerId = function (arrayOfMeals) {
    const res = []
    arrayOfMeals.forEach((meal) => {
        if(!res.find(x => x.userId === meal['CUSTOMER ID'])) {
            res.push({userId: meal['CUSTOMER ID']})
            if(meal.QTE >= 0) {
                res.find(x => x.userId === meal['CUSTOMER ID'])[meal['SUBSCRIPTION']] = []
                for(let i = 0; i < meal.QTE; i++) {
                    res.find(x => x.userId === meal['CUSTOMER ID'])[meal['SUBSCRIPTION']].push(meal['CODE_ART'])
                }
            }
        } else {
            if(!res.find(x => x.userId === meal['CUSTOMER ID'])[meal['SUBSCRIPTION']]) {
                if(meal.QTE >= 0) {
                    res.find(x => x.userId === meal['CUSTOMER ID'])[meal['SUBSCRIPTION']] = []
                    for(let i = 0; i < meal.QTE; i++) {
                        res.find(x => x.userId === meal['CUSTOMER ID'])[meal['SUBSCRIPTION']].push(meal['CODE_ART'])
                    }
                }
            }
            else {
                if(meal.QTE >= 0) {
                    for(let i = 0; i < meal.QTE; i++) {
                        res.find(x => x.userId === meal['CUSTOMER ID'])[meal['SUBSCRIPTION']].push(meal['CODE_ART'])
                    }
                }
            }

            addField('PRENOM', res, meal)
            addField('NOM', res, meal)
        }
    })
    return res
}

const addField = function (fieldName, arrayOfUsers, meal) {
    if(!arrayOfUsers.find(x => x.userId === meal['CUSTOMER ID'])[fieldName]) {
        arrayOfUsers.find(x => x.userId === meal['CUSTOMER ID'])[fieldName] = meal[fieldName]
    }
    else {
        arrayOfUsers.find(x => x.userId === meal['CUSTOMER ID'])[fieldName] = meal[fieldName]
    }
    return arrayOfUsers
}

const getAllMeals = async function () {
    let arrayOfMeals = []
    await axios.get('https://spreadsheets.google.com/feeds/list/1PjjHg7mwrqEc-P0YpFFVmsxd4vtPCcXFLekHfRV1E9E/1/public/values?alt=json').then((rawData) => {
        if (rawData.data && rawData.data.feed) {
            const restrictionTable = rawData.data.feed.entry
            for (const elmt in restrictionTable[0]) {
                if (elmt.includes('gsx')) {
                    // list for traduction of columns
                    trads.restrictions[elmt] = restrictionTable[0][elmt].$t.toLowerCase()
                }
            }
            for (const i in restrictionTable) {
                if(restrictionTable[i]['gsx$_cokwr'] && isMealDivisible(restrictionTable[i]['gsx$_cokwr']['$t'])) {
                    const index = isMealDivisible(restrictionTable[i]['gsx$_cokwr']['$t'])
                    arrayOfMeals.push(createMeal(restrictionTable[i], index, i))

                } else {
                    arrayOfMeals.push(createMeal(restrictionTable[i], 1, i))
                }
            }
            // temporary filter for MVP
            /*
                        arrayOfMeals = arrayOfMeals.filter(x => x.type.toLowerCase() === 'plats')
            */
        }
    })
    await axios.get('https://spreadsheets.google.com/feeds/list/1PjjHg7mwrqEc-P0YpFFVmsxd4vtPCcXFLekHfRV1E9E/2/public/values?alt=json').then((rawData) => {
        if (rawData.data && rawData.data.feed) {
            const recipeTable = rawData.data.feed.entry
            for (const i in recipeTable) {
                const meal = recipeTable[i]
                const ref = meal.gsx$ref && meal.gsx$ref.$t ? meal.gsx$ref.$t : null
                const pitch = meal.gsx$pitch && meal.gsx$pitch.$t ? meal.gsx$pitch.$t : null
                const preparation = meal.gsx$preparation && meal.gsx$preparation.$t ? meal.gsx$preparation.$t : null
                if (arrayOfMeals.find(m => m.ref === ref) && !!meal.gsx$listedingrédients) {
                    arrayOfMeals.find(m => m.ref===  ref).recipe = meal.gsx$listedingrédients.$t
                    arrayOfMeals.find(m => m.ref === ref).pitch = pitch
                    arrayOfMeals.find(m => m.ref === ref).preparation = preparation
                }
            }
        }
    })
    await axios.get('https://spreadsheets.google.com/feeds/list/1PjjHg7mwrqEc-P0YpFFVmsxd4vtPCcXFLekHfRV1E9E/3/public/values?alt=json').then((rawData) => {
        if (rawData.data && rawData.data.feed) {
            const kcalTable = rawData.data.feed.entry
            for (const i in kcalTable) {
                const meal = kcalTable[i]
                const ref = meal.gsx$ref && meal.gsx$ref.$t ? meal.gsx$ref.$t : null
                if (arrayOfMeals.find(m => m.ref === ref) && !!meal.gsx$kcal) {
                    arrayOfMeals.find(m => m.ref === ref).Kcal = meal.gsx$kcal.$t
                }
                if (arrayOfMeals.find(m => m.ref === ref) && !!meal.gsx$glucides) {
                    arrayOfMeals.find(m => m.ref === ref).glucides = meal.gsx$glucides.$t
                }
                if (arrayOfMeals.find(m => m.ref === ref) && !!meal.gsx$lipides) {
                    arrayOfMeals.find(m => m.ref === ref).lipides = meal.gsx$lipides.$t
                }
                if (arrayOfMeals.find(m => m.ref === ref) && !!meal.gsx$protéines) {
                    arrayOfMeals.find(m => m.ref === ref).proteines = meal.gsx$protéines.$t
                }
            }
        }
    })
    return arrayOfMeals
}
const createMeal = function (meal, q, counterId) {
    const title = meal.gsx$_chk2m && meal.gsx$_chk2m.$t ? meal.gsx$_chk2m.$t : 'titre introuvable'
    const innerSteps = meal.gsx$_cn6ca && meal.gsx$_cn6ca.$t ? [meal.gsx$_cn6ca.$t] : []
    const ref = meal.gsx$_cokwr && meal.gsx$_cokwr.$t ? meal.gsx$_cokwr.$t : null
    const dayTime = meal.gsx$_cpzh4 && meal.gsx$_cpzh4.$t ? meal.gsx$_cpzh4.$t : null
    const type = meal.gsx$_cn6ca && meal.gsx$_cn6ca.$t ? meal.gsx$_cn6ca.$t : null
    const quantity = q
    const imgSrc = meal.gsx$_ciyn3 && meal.gsx$_ciyn3.$t ? meal.gsx$_ciyn3.$t : ''
    for (const column in meal) {
        if (isCellChecked(column, meal)) {
            ingredients[trads.restrictions[column]] = ingredients[trads.restrictions[column]] === false ? true : null
            allergens[trads.restrictions[column]] = allergens[trads.restrictions[column]] === false ? true : null
        }
    }
    return { title, type, innerSteps, ref, dayTime, quantity, imgSrc, ingredients, allergens }
}
const isCellChecked = function (c, e) {
    return e[c].$t && e[c].$t.toLowerCase() === 'x'
}


const isMealDivisible = function(ref) {
    const refs = {
        'BIO-PAINBOULE': 6,
        'PYC-PAINCEREAL': 6,
        'EMC-HAZELHONEY': 6,
        'FAV-SUPERFRUIT': 6,
        'FAV-FLK3CHOCO': 6,
        'EMC-FRUITS': 6,
        'BIO-PAVECEREALS': 6,
        'WEI-CHOCOLAIT': 18,
        'WEI-CHOCONOIR': 18,
        'AGRO-COCOBAR': 6,
        'SP-BARPEANUT': 6,
        'AGRO-MIXGRAINES': 6,
        'PYC-BOUCHEGOURCB': 6,
        'NS-BISCNOIS': 4,
        'NS-BISCORANGE': 4,
        'AGRO-BANANABAR': 6,
    }
    if(refs[ref]) {
        return refs[ref]
    } else {
        return false
    }
}


// Partie 2: Distribution des plats dans le semainier


export default apiRoute;
export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};
