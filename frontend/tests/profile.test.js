import assert from "node:assert/strict";
import { isProfileComplete, validateProfile } from "../src/schemas/profile.js";

const validProfile = {
  id: "1",
  name: "Chiva",
  firstSurname: "Garcia",
  secondSurname: "Lopez",
  documentId: "ABC123456",
  currency: "EUR",
  email: "chiva@example.com",
  phone: "+34 600 000 000",
  password: "secret1"
};

assert.equal(validateProfile(validProfile, []), "");
assert.equal(isProfileComplete(validProfile), true);
assert.equal(isProfileComplete({ ...validProfile, documentId: "" }), false);
assert.equal(validateProfile({ ...validProfile, email: "mal" }, []), "Correo inválido.");
assert.equal(validateProfile({ ...validProfile, phone: "abc" }, []), "Número de teléfono inválido.");

console.log("AtlasIQ profile validation check passed");
