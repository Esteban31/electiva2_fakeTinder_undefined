import swipes from "../../swipesData.js"

export const swipeActionService = (data) =>{

     const search = swipes.find((item) => item.targetEmailUser === data.targetEmailUser);
     
     if (search != undefined) {
        console.log("Lo creamos")
        swipes.push(data)
     }else{
        console.log("No lo creamos")
     }

}