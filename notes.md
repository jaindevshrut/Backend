# Model Reference 
- [Model Link](https://app.eraser.io/workspace/HT6FQB8prIWyBYtLDVVv?origin=share)


many times it will happen that we will create an empty folder and we want to push that folder. But git tracks the file so we will create a .gitkeep file inside that folder so that it starts the tracking of the folder

we use gitignore generator for the content of gitignore 

nodemon is used to restart the server whenever changes happen to the file

prettier is very important for the industry level porject as many working on the same project have different ways of giving indexing to lines etc to resolve these conflicts in github we need to initialize its settings earlier in the project. We need to create a file named .prettierrc which will include the prttier settings. 
.prettierignore is the file in which we tell in which files we need to ignore prettier


jb bhi database se connect krna h toh try cath use kare aur async ka use kare kyuki vo dusare continent me reh skta h

iffi ko check krna vo direct function to create krne ke sath run bhi krdeta h

jis file ko sabse pehle hum run krne wale h usme ham sabse pehle env ko inport krle require('dotenv').config se taki sari files ko access mil jaye

kyuki ham consistency maintain krke rkhe h code me isliye ham import dotenv from "dotenv"
dotenv.config({path: "../env"}) use kr rahe index.js me aur uske liye hame nodemon -r dotenv/config use krna padega package.json file me