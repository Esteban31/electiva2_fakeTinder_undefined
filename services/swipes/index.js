import {swipes} from "../../swipesData.js"

export const swipeActionService = (data) =>{

     const search = swipes.find((item) => item.targetEmailUser === data.targetEmailUser);

     console.log(search)
     
     if (search === undefined) {
        console.log("Lo creamos")
        swipes.push(data)
        return true
     }else{
        console.log("No lo creamos")
        return false
     }

}


export const getMatchSwipesService = (email) =>{

    console.log(swipes)

    const search = swipes.find((item) => (item.emailUser === email || item.targetEmailUser === email) && item.action === 'Like');

    console.log(search)
    
    return search

}