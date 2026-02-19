import { sha512_256 } from "js-sha512";

const hash = sha512_256.array("test");
console.log(hash);
