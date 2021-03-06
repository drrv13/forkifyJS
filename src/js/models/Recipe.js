import axios from 'axios';
import { key } from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    async getRecipe() {
        try {
            const res = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            console.log(error);
            alert(`something wrong`);
        }
    }
    calcTime() {
        //assuming that we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }
    calcServings() {
        this.servings = 4;
    }
    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const codeInt = ['&frac12;', '&frac14;', 'about'];
        const codeNum = ['+1/2', '+1/4', '0'];
        const newIngredients = this.ingredients.map(el => {
            //1. uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            codeInt.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, codeNum[i]);
            });
            //2. remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            //3. parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            let objIng;
            if (unitIndex > -1) {
                // there is a unit
                const arrCount = arrIng.slice(0, unitIndex);
               
                let count;
               
                if (arrCount.length === 1 && arrIng[0].typeof === 'number') {
                    count = eval(arrIng[0].replace('-', '+'));
                }  else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                if (unitIndex === 0 || arrIng[0] === '') {
                    count = 1;}
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1, arrIng.length).join(' ')
                }
            } else if (parseInt(arrIng[0], 10)) {
                // there is no unit, but 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join('')
                }
            } else if (unitIndex === -1) {
                // there is no unit
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    }
    updateServings (type) {
        //servings
        const newServings = (type === 'inc') ? this.servings +1 : this.servings  -1;

       
        //ingredients
        this.ingredients.forEach(ing => {
            //ing.count = (ing.count * (newServings / this.servings)).toFixed(2);
            ing.count *= newServings / this.servings;
        })


        this.servings = newServings;
    }
};