import bcrypt from "bcrypt";

const hash = "$2a$10$oZ/sgau65A7IvwRAV/J3JekhJB4hOC4HhxmjBq96pOwSaCTlPKkIa";
const plainPassword = "Esware@2002";

const match = await bcrypt.compare(plainPassword, hash);
//// console.log(match , `forrr hfdkjdbhfjdbhfudgbf`); // true if correct, false otherwise
