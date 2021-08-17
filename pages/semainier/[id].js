import { useRouter } from 'next/router'
import axios from "axios";
import {useState} from "react";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import {useEntry} from "../../lib/swr-hooks";


let mealsByType = { breakfast: [], lunch: [], diner: [], collation: [], unknown: [] }
let hasConfiture = false
let hasChoco = false

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



export const getStaticPaths = async () => {
    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}


export async function getStaticProps(context) {
    const allMeals = await getAllMeals()
    if (!allMeals) {
        return {
            notFound: true,
        }
    }
    return {
        props: { allMeals }, // will be passed to the page component as props
    }
}

export default function EditEntryPage({allMeals}) {
    const router = useRouter()
    console.log('bef')
    const { data } = useEntry(router.query.id)
    let meals = ""
    if(data) {
        meals = data['MEALS']
    }


    let [plats, setPlats] = useState([])
    if(meals && meals.length > 0) {
        meals = JSON.parse(meals)
        let userMeals = findMealsForRefs(meals)
        if(plats.length === 0) {
            userMeals = userMeals.map(({id, ...rest}, j) => ({...rest, id: j}));
            console.log('customer meals raw', userMeals)

            setPlats(getMealsByType(userMeals))
            console.log('Paires de plats', plats)
        }
    }



    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }


    async function  printDocument() {
        try {
            const response = await axios.post(`/api/get-pdf`, {url: window.location.href}, {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'application/pdf'
                }});
            const blob = new Blob([response.data], {type: 'application/pdf'})
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `your-file-name.pdf`
            link.click()

        } catch (e) {
            alert(e)
        }
    }

    function findMealsForRefs(arrayOfRefs) {
        const res = []

        arrayOfRefs.forEach((ref, i) => {

            if(allMeals.find(meal => meal.ref.toLowerCase() === ref.toLowerCase())) {
                let meal = allMeals.find(meal => meal.ref.toLowerCase() === ref.toLowerCase() )
                res.push(meal)
            } else {
                console.error('could not find ref', ref)
            }
        })
        return res
    }

    function getDayTime(type, index) {
        switch (type) {
            case 'PDJ':
                return 'PETIT DEJEUNER'
                break
            case 'DESSERT':
                return 'PETIT DEJEUNER'
                break
            case 'COLLATION':
                return 'COLLATION'
                break
            case 'PLATS':
                return index % 3 ? 'DEJEUNER' : 'DINER'
                break
            default:
                break
        }
    }
    function getExtraTexts(type) {
        switch (type) {
            case 'PDJ':
                return ['1 boisson chaude', '1 produit laitier', '1 fruit']
                break
            case 'DESSERT':
                return ['1 boisson chaude', '1 produit laitier', '1 fruit']
                break
            case 'COLLATION':
                return ['1 boisson chaude']
                break
            case 'PLATS':
                return ['1 assiette de légumes ou crudités ou 1 bol de soupe', '1 fruit ou 1 produit laitier']
                break
            default:
                return []
                break
        }
    }

    function getSource(type) {
        switch (type) {
            case 'PDJ':
                return 'https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/pictos-qilibri-58.png'
                break
            case 'DESSERT':
                return 'https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/pictos-qilibri-58.png'
                break
            case 'COLLATION':
                return 'https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/pictos-qilibri-60.png'
                break
            case 'PLATS':
                return 'https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/pictos-qilibri-61.png'
                break
            default:
                return ''
                break
        }
    }
    function getExtraCards(index) {
        let hydroSentence = "NB: n'oubliez pas de boire au moins 1.5L d'eau par jour"

        if(index === 5 || index === 11 || index === 17 || index === 23) {
            return (
                <div className="row">
                    <div className="col-12 col-md-6 p-4 h-100">
                        <div className="card-cont bg-sec">
                            <div className=" p-2 meal-card-header-sec text-center ">
                                <h5 className="primcolor">JE ME FAIS PLAISIR AVEC LA JOURNEE LIBRE</h5>

                            </div>
                            <div className="h-100 extra-day-card bg-sec p-4 ">
                                <div className="flex-column d-flex h-100">
                                    <div  className="flex flex-row col-12 ">
                                        <img className="card-icon-extra " src="https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/Assiette-01.png" />
                                        <span className="mx-3">Aujourd'hui je me suis régalé avec ...</span>


                                    </div>
                                    <div className=" mt-auto  mb-2">{hydroSentence}</div>

                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 p-4">

                        <div className="card-cont bg-sec p-4 ">

                                <img className="card-icon-extra mr-2" src="https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/Balance-02.png" />

                                <h5 className="primcolor mr-auto text-left italicTypo">CHAQUE JOUR JE ME RAPPROCHE DE MON OBJECTIF</h5>
                            <div className=" extra-day-card bg-sec p-4 ">
                                <div className="row ">
                                    <ul  className=" col-12 p-3">
                                        <li>Mon poids de départ: ........kg</li>
                                        <li>Mon poids cette semaine: ........kg</li>
                                        <li>Mon poids cible: ........kg</li>
                                    </ul>
                                </div>
                                <div className="flex flex-row p-2   ">
                                    <img className="card-icon-extra mr-2" src="https://brz-mon-panier-minceur.s3.eu-central-1.amazonaws.com/semainier/Alte%E2%95%A0%C3%87re-03.png" />

                                    <h5 className="primcolor mr-auto text-left italicTypo">Je me sens mieux dans mon corps</h5>
                                </div>
                                <div className="row ">
                                    <div  className=" col-12 p-3">
                                        Cette semaine, j'ai fais des séances de ..... <br/> pendant ...... minutes
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>



                </div>
            )
        }
        return null
    }


    let chocoSentence = hasChoco ? "NB: N'hésitez pas à prendre un carré de chocolat au moment de la journée qui vous fait envie" : ''
    function getConfiture(e) {
        if(!e) {
            return ''
        }
        if(e.ref.toLowerCase().includes('and-')) {
            return 'Faites-vous plaisir ! Vous pouvez mettre une cuillère à café de confiture sur vos tartines'
        }
        return ''
    }
    return (
        <div  id="semainier">
            <div   className="row container mx-auto">
                <div  className="text-center mb-3">
                    <h1>
                        Au menu de mon <em>Programme essentiel</em>
                    </h1>
                </div>
                {plats.map((plat, index) => (
                    <>
                        <div key={index} className="row p-4 container    col-12 col-md-6">
                            <div className="card-cont">
                                <div className="row p-2 meal-card-header text-center ">
                                    <h3 className="primcolor">JOUR {index + 1}</h3>
                                </div>
                                <div className=" day-card ">
                                    <div className="row">
                                        {plat.map((e, k) => (
                                            <div key={k} className="lunch-cont col-12 col-md-6 p-2">
                                                <img className="card-icon align-self-center  pr-1" src={getSource(e?.type)} />
                                                <div className="flex  flex-column">
                                                    <h5 className="day-time">{getDayTime(e?.type, k)}</h5>
                                                    <ul>
                                                        <li className="meal-li">{e?.title}</li>
                                                    </ul>
                                                    <ul >
                                                        {getExtraTexts(e?.type).map((extra, y) => (
                                                            <li key={y} className="primcolor">{extra}</li>
                                                        ))}                                            </ul>
                                                </div>
                                                <div className=" mt-auto mb-2">{getConfiture(e)}</div>

                                            </div>
                                        ))}
                                    </div>

                                </div>
                                <div  className="mb-2 mt-auto little">{chocoSentence}</div>

                            </div>

                        </div>
                        {getExtraCards(index)}

                    </>

                ))}
            </div>
        </div>
    )

}

    function addMealToType(type, meal) {
    for (let i = 0; i <= meal.quantity; i++) {
        mealsByType[type].push(meal)
    }
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
                    arrayOfMeals.find(m => m.ref === ref).recipe = meal.gsx$listedingrédients.$t
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
                if (arrayOfMeals.find(m => m.ref.toLowerCase() === ref.toLowerCase()) && !!meal.gsx$kcal_2) {
                    arrayOfMeals.find(m => m.ref.toLowerCase() === ref.toLowerCase()).Kcal = meal.gsx$kcal_2.$t
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
    const res =  []
    return arrayOfMeals
}
const createMeal = function (meal, q, counterId) {
    const title = meal.gsx$_chk2m && meal.gsx$_chk2m.$t ? meal.gsx$_chk2m.$t : 'titre introuvable'
    const innerSteps = meal.gsx$_cn6ca && meal.gsx$_cn6ca.$t ? [meal.gsx$_cn6ca.$t] : []
    const ref = meal.gsx$_cokwr && meal.gsx$_cokwr.$t ? meal.gsx$_cokwr.$t : null
    const dayTime = meal.gsx$_cpzh4 && meal.gsx$_cpzh4.$t ? meal.gsx$_cpzh4.$t : null
    const type = meal.gsx$_cn6ca && meal.gsx$_cn6ca.$t ? meal.gsx$_cn6ca.$t : null
    const mainDish = meal.gsx$principal && meal.gsx$principal.$t ? meal.gsx$principal.$t : null
    const subDish = meal.gsx$accompagnement && meal.gsx$accompagnement.$t ? meal.gsx$accompagnement.$t : null
    const quantity = q
    const imgSrc = meal.gsx$_ciyn3 && meal.gsx$_ciyn3.$t ? meal.gsx$_ciyn3.$t : ''
    for (const column in meal) {
        if (isCellChecked(column, meal)) {
            ingredients[trads.restrictions[column]] = ingredients[trads.restrictions[column]] === false ? true : null
            allergens[trads.restrictions[column]] = allergens[trads.restrictions[column]] === false ? true : null
        }
    }
    return {title, type, mainDish, subDish, innerSteps, ref, dayTime, quantity, imgSrc, ingredients, allergens }
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
        'EMCO-FRUITS': 6,
        'EMCO-HAZELNUTS': 6,
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
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const getMealsByType = function(meals) {
    const allMeals = meals
    const plats = meals.filter(x => x.type.toLowerCase() === 'plats')
    console.log('---------------------------------------------------------------------------------------------------------------', plats.length)
    mealsByType.breakfast.length = 0
    mealsByType.lunch.length = 0
    mealsByType.collation.length = 0
    mealsByType.diner.length = 0
    mealsByType.unknown.length = 0
    allMeals.forEach((meal, i) => {
        switch (meal.type.toLowerCase()) {
            case 'pdj':
                addMealToType('breakfast', meal)
                break
            case 'dessert':
                addMealToType('breakfast', meal)
                break
            case 'collation':
                addMealToType('collation', meal)
                break
            default:
                mealsByType.unknown.push(meal)
                break
        }
    })


    let pairsByKcal = getPaires(sortMealsByKcal(plats))

    let paires = agencement(pairsByKcal)
    if(mealsByType.breakfast.find(x => x.ref.toLowerCase().includes('and-'))) {
        hasConfiture = true
    }
    if(mealsByType.breakfast.find(x => x.ref.toLowerCase().includes('choco'))) {
        hasChoco = true
        mealsByType.breakfast = mealsByType.breakfast.filter(x => !x.ref.toLowerCase().includes('choco'))
    }

    let title = ''
    let title2 = ''
    let title3 = ''
    let title4 = ''
    const breadAndCompote = mealsByType.breakfast.find(x => x.ref === 'BIO-PAINBOULE' || x.ref === 'BIO-PAVECEREALS' || x.ref === 'PYC-PAINCEREAL')
        && mealsByType.breakfast.find(x => x.ref === 'VAL-POMME' || x.ref === 'VAL-POIRE' || x.ref === 'VAL-PECHE' || x.ref === 'GOL-MIXFRUTS')
    const breadAndMuesli = mealsByType.breakfast.find(x => x.ref === 'BIO-PAINBOULE' || x.ref === 'BIO-PAVECEREALS' || x.ref === 'PYC-PAINCEREAL') && mealsByType.breakfast.find(x => x.ref === 'FAV-SUPERFRUIT' || x.ref === 'FAV-FLK3CHOCO'  || x.ref === 'EMCO-FRUITS' || x.ref === 'EMCO-HAZELNUTS')

    mealsByType.breakfast = mealsByType.breakfast.filter(x => !x.ref.toLowerCase().includes('and-'))

    const muesliAndCompote = mealsByType.breakfast.find(x => x.ref === 'FAV-SUPERFRUIT' || x.ref === 'FAV-FLK3CHOCO'  || x.ref === 'EMCO-FRUITS' || x.ref === 'EMCO-HAZELNUTS') && mealsByType.breakfast.find(x => x.ref === 'VAL-POMME' || x.ref === 'GOL-MIXFRUTS' || x.ref === 'VAL-POIRE' || x.ref === 'VAL-PECHE')
    const crazyHorse = mealsByType.breakfast.find(x => x.ref === 'BIO-PAINBOULE' || x.ref === 'BIO-PAVECEREALS' || x.ref === 'PYC-PAINCEREAL')
        && mealsByType.breakfast.find(x => x.ref === 'VAL-POMME' || x.ref === 'GOL-MIXFRUTS' || x.ref === 'VAL-POIRE' || x.ref === 'VAL-PECHE')
        && mealsByType.breakfast.find(x => x.ref === 'FAV-SUPERFRUIT' || x.ref === 'FAV-FLK3CHOCO'  || x.ref === 'EMCO-FRUITS' || x.ref === 'EMCO-HAZELNUTS')

    const onlyBread = mealsByType.breakfast.find(x => x.ref === 'BIO-PAINBOULE' || x.ref === 'BIO-PAVECEREALS' || x.ref === 'PYC-PAINCEREAL')
    const onlyMuesli = mealsByType.breakfast.find(x => x.ref === 'FAV-SUPERFRUIT' || x.ref === 'FAV-FLK3CHOCO'  || x.ref === 'EMCO-FRUITS' || x.ref === 'EMCO-HAZELNUTS')
    if(crazyHorse) {
        mealsByType.breakfast = mealsByType.breakfast.filter(x => x.ref !== 'BIO-PAINBOULE' && x.ref !== 'BIO-PAVECEREALS' && x.ref !== 'PYC-PAINCEREAL' && x.ref !== 'VAL-POMME' && x.ref !== 'GOL-MIXFRUTS' && x.ref !== 'VAL-POIRE' && x.ref !== 'VAL-PECHE'
            && x.ref !== 'FAV-SUPERFRUIT' && x.ref !== 'FAV-FLK3CHOCO'  && x.ref !== 'EMCO-FRUITS' && x.ref !== 'EMCO-HAZELNUTS' )
        title2 = 'Pain + Muesli'
        title4 = 'x2 Muesli + Compote'
        mealsByType.breakfast.push( {
            title: title2,
            ref: 'COMBO-PDJ-2',
            type: 'PDJ'
        })
        mealsByType.breakfast.push( {
            title: title4,
            ref: 'COMBO-PDJ-3',
            type: 'PDJ'
        })
    }
    else  if(muesliAndCompote) {
        mealsByType.breakfast = mealsByType.breakfast.filter(x => x.ref !== 'VAL-POMME' && x.ref !== 'GOL-MIXFRUTS' && x.ref !== 'VAL-POIRE' && x.ref !== 'VAL-PECHE'  && x.ref !== 'FAV-SUPERFRUIT' && x.ref !== 'FAV-FLK3CHOCO'  && x.ref !== 'EMCO-FRUITS' && x.ref !== 'EMCO-HAZELNUTS' )
        title2 = 'x2 Muesli + Compote'
        mealsByType.breakfast.push( {
            title:title2,
            ref: 'COMBO-PDJ',
            type: 'PDJ'
        })
        mealsByType.breakfast.splice(2, 0, {
            title: title2,
            ref: 'COMBO-PDJ-2',
            type: 'PDJ'
        });
    } else if(breadAndMuesli) {
        mealsByType.breakfast = mealsByType.breakfast.filter(x => x.ref !== 'BIO-PAINBOULE' && x.ref !== 'BIO-PAVECEREALS' && x.ref !== 'PYC-PAINCEREAL'  && x.ref !== 'FAV-SUPERFRUIT' && x.ref !== 'FAV-FLK3CHOCO'  && x.ref !== 'EMCO-FRUITS' && x.ref !== 'EMCO-HAZELNUTS')
        title = 'Pain + Muesli'
        mealsByType.breakfast.push( {
            title: title,
            ref: 'COMBO-PDJ',
            type: 'PDJ'
        })
        mealsByType.breakfast.splice(2, 0, {
            title: title,
            ref: 'COMBO-PDJ-2',
            type: 'PDJ'
        });
    }  else if(breadAndCompote) {
        mealsByType.breakfast = mealsByType.breakfast.filter(x => x.ref !== 'BIO-PAINBOULE' && x.ref !== 'BIO-PAVECEREALS' && x.ref !== 'PYC-PAINCEREAL' && x.ref !== 'VAL-POMME' && x.ref !== 'GOL-MIXFRUTS' && x.ref !== 'VAL-POIRE' && x.ref !== 'VAL-PECHE'  && x.ref !== 'FAV-SUPERFRUIT' && x.ref !== 'FAV-FLK3CHOCO'  && x.ref !== 'EMCO-FRUITS' && x.ref !== 'EMCO-HAZELNUTS' )
        title =  'Pain + Compote'
        mealsByType.breakfast.push( {
            title:title,
            ref: 'COMBO-PDJ',
            type: 'PDJ'
        })
        mealsByType.breakfast.splice(2, 0, {
            title:title,
            ref: 'COMBO-PDJ-2',
            type: 'PDJ'
        });
    } else if(onlyBread) {
        mealsByType.breakfast = mealsByType.breakfast.filter(x => x.ref === 'BIO-PAINBOULE' && x.ref === 'BIO-PAVECEREALS' && x.ref === 'PYC-PAINCEREAL' )
        title =  'x2 Pain'
        mealsByType.breakfast.push( {
            title:title,
            ref: 'COMBO-PDJ',
            type: 'PDJ'
        })
        mealsByType.breakfast.splice(2, 0, {
            title:title,
            ref: 'COMBO-PDJ-2',
            type: 'PDJ'
        });
    }  else if(onlyMuesli) {
        mealsByType.breakfast = mealsByType.breakfast.filter(x =>  x.ref !== 'FAV-SUPERFRUIT' && x.ref !== 'FAV-FLK3CHOCO'  && x.ref !== 'EMCO-FRUITS' && x.ref !== 'EMCO-HAZELNUTS')
        title = 'x2 Muesli'
        mealsByType.breakfast.push({
            title: title,
            ref: 'COMBO-PDJ',
            type: 'PDJ'
        })
        mealsByType.breakfast.splice(2, 0, {
            title: title,
            ref: 'COMBO-PDJ-2',
            type: 'PDJ'
        });
    }
    console.log('brakfast after ', mealsByType.breakfast)


    const uniqueCollations = mealsByType.collation.filter(onlyUnique)
    const uniquePDJ = mealsByType.breakfast.filter(onlyUnique)

    let collationCounter = 0
    let PDJCounter = 0
    paires.forEach((paire) => {
        if(collationCounter >= uniqueCollations.length) {
            collationCounter = 0
        }
        if(PDJCounter >= uniquePDJ.length) {
            PDJCounter = 0
        }
        paire.unshift(uniquePDJ[PDJCounter])
        paire.splice(2, 0, uniqueCollations[collationCounter]);
        collationCounter++
        PDJCounter++

    })
    if(paires) {
        console.log('Nombre de plats a distribuer  ', paires.length * 2 )
        if(plats.length < 48 ) {
            console.log('not enough meals' ,plats)
        }
    }



    return paires
}


const agencement = function(bef) {
    let paires = [...bef]
    let melki = []
    let stopThisShit = false
    while( paires.length !== 0 && !stopThisShit) {
        const paire = paires[paires.length -1]
        const lunch = paires[paires.length -1][0]
        let pureness = null
        let mainDishCond = null
        let subDishCond = null
        if(melki[melki.length - 1]) {
            pureness = melki[melki.length - 1][0].mainDish !== lunch.mainDish && melki[melki.length - 1][0].subDish !== lunch.subDish && !melki.find(x => x === paire)
            mainDishCond = melki[melki.length - 1][0].mainDish === lunch.mainDish
            subDishCond = melki[melki.length - 1][0].subDish === lunch.subDish
            /*
                        console.log('next pair ? ',lunch, melki[melki.length-1][0], pureness, affordableCond, miskineCond)
            */
        }
        if( melki.length === 0 || pureness ) {
            melki.push(paire)
            paires = paires.filter(x => x !== paire)
        } else if ((mainDishCond && paires.filter(x => x[0].mainDish !== melki[melki.length - 1].mainDish).length > 0 )
            ||( subDishCond && paires.filter(x => x[0].subDish !== melki[melki.length - 1].subDish).length > 0)) {
            let availablePairs = paires.filter(x => x[0].mainDish !== melki[melki.length - 1].mainDish)
            melki.forEach( (pair) => {
                availablePairs = availablePairs.filter(x => x[0].id !== pair[0].id  )
            })

            if(availablePairs && availablePairs.length > 0 ) {
                melki.push(availablePairs[0])
                paires = paires.filter(x => x !== availablePairs[0])
                paires.push(paire)
            }  else {
                if(melki.find(x => x == paire)){
                    paires = paires.filter(x => x == paire)
                }
                stopThisShit = true

            }
        }  else {
            console.log('no suitable PAIR found', paire)
            melki.push(paire)
            paires = paires.filter(x => x !== paire)
        }

        /*
                console.log('After repairing', melki[melki.length - 1][0])
        */
    }
    return melki.reverse()
}




const getPaires = function(meals) {
    const res = []
    while(meals.length !== 0) {
        let lowMeal = meals[0]
        const highMeal = meals[meals.length - 1]
        if(highMeal && lowMeal) {
            if(highMeal.mainDish === lowMeal.mainDish) {
                const perfectDish = meals.find(x => x.mainDish !== highMeal.mainDish && x.subDish !== highMeal.subDish)
                const affordableDish = meals.find(x => x.mainDish !== highMeal.mainDish)
                if(perfectDish && !res.find(x => x[0].id === perfectDish.id || x[1].id === perfectDish.id)) {
                    lowMeal = meals.filter(x => x.mainDish !== highMeal.mainDish && x.subDish !== highMeal.subDish)[0]
                } else if(affordableDish && !res.find(x => x[0].id === affordableDish.id || x[1].id === affordableDish.id)) {
                    lowMeal = meals.filter(x => x.mainDish !== highMeal.mainDish)[0]
                }
            }
            else if(highMeal.subDish === lowMeal.subDish ) {
                const perfectSubDish = meals.find(x => x.subDish !== highMeal.subDish && x.mainDish !== highMeal.mainDish)
                const affordableSubDish = meals.find(x => x.subDish !== highMeal.subDish)
                if(perfectSubDish && !res.find(x => x[0].id === perfectSubDish.id || x[1].id === perfectSubDish.id)) {
                    lowMeal = meals.filter(x => x.mainDish !== highMeal.mainDish && x.subDish !== highMeal.subDish)[0]
                } else if(affordableSubDish && !res.find(x => x[0].id === affordableSubDish.id || x[1].id === affordableSubDish.id )) {
                        lowMeal = meals.filter(x => x.subDish !== highMeal.subDish)[0]
                }
            }
            meals = meals.filter(x => x !== lowMeal &&  x !== highMeal)
            res.push([lowMeal, highMeal])
        }
    }
    console.log('end get paires', res)
    return res
}


const sortMealsByKcal = function(meals) {
    return meals.sort(function (a, b) {
        return b.Kcal - a.Kcal;
    });

}

